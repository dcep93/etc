from bs4 import BeautifulSoup
import cookielib
import urllib2

cookieTxt = "/Users/danielcepeda/Downloads/cookies.txt"

cj = cookielib.MozillaCookieJar(cookieTxt)
cj.load(cookieTxt, ignore_discard=True, ignore_expires=True)
opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))

pulledPages = {}

def main():
	startURL = "https://cloud.google.com/spanner"
	depth = 0

	pull(startURL, startURL, depth)
	savePages(startURL)

def pull(startURL, matchURL, depth):
	page = getPage(startURL)
	pulledPages[startURL] = page
	downloadDependencies(page, matchURL)
	if depth > 0:
		links = getLinks(page, matchURL)
		for link in page.findAll("a", href=True):
			if link["href"].startswith(matchURL):
				pull(link["href"], matchURL, depth-1)

def savePages(matchURL):
	for url, page in pulledPages.items():
		updateLinks(page, matchURL)
		save(url, page.prettify(), matchURL)

def save(url, text, matchURL):
	path = urlToPath(url, matchURL)
	with open(path, 'w') as fh:
		fh.write(text)
	return path

def urlToPath(url, matchURL):
	path = url[len(matchURL)+1:]
	if path.endswith("/"):
		path += "index"
	if not path.endswith(".html"):
		path += ".html"
	return path

def updateLinks(page, matchURL):
	for anchor in page.findAll("a", href=True):
		if anchor["href"] in pulledPages:
			anchor["href"] = urlToPath(anchor["href"], matchURL)

def getPage(url):
	print url
	html = opener.open(url).read()
	page = BeautifulSoup(html, "lxml")
	return page

def downloadDependencies(page, matchURL):
	for js in page.findAll("script", src=True):
		if js['src'].startswith(matchURL):
			print js
			js['src'] = downloadDependency(js['src'], matchURL)
	for css in page.findAll("link"):
		if css['href'].startswith(matchURL):
			print css
			css['href'] = downloadDependency(css['href'], matchURL)

def downloadDependency(url, matchURL):
	text = opener.open(url).read()
	path = save(url, text, matchURL)
	return path


if __name__ == "__main__":
	main()