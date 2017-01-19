from bs4 import BeautifulSoup
import cookielib
import os
import urllib2
import sys

pulledPages = {}

def main():
	startURL = sys.argv[1]
	cookieTxt = sys.argv[2] if len(sys.argv) > 2 else ""

	matchURL = "/".join(startURL.split("/")[:-1])
	if len(sys.argv) > 2 and sys.argv[2] == "-":
		s = matchURL.split("//")
		matchURL = s[0] + "//" + s[1].split("/")[0]

	depth = 1

	opener = urllib2.build_opener()
	if os.path.isfile(cookieTxt):
		cj = cookielib.MozillaCookieJar(cookieTxt)
		cj.load(cookieTxt, ignore_discard=True, ignore_expires=True)
		opener.add_handler(urllib2.HTTPCookieProcessor(cj))

	pull(startURL, matchURL, depth, opener)
	savePages(startURL)

def pull(startURL, matchURL, depth, opener):
	if depth == 0: return
	page = getPage(startURL, opener)
	pulledPages[urlToPulledPage(startURL)] = page
	if page is None: return
	downloadDependencies(page, opener, matchURL, startURL)
	nextRound = []
	for link in page.findAll("a", href=True):
		linkUrl = link["href"].split("?")[0].split("#")[0]
		pulledPage = urlToPulledPage(linkUrl)
		if linkUrl.startswith(matchURL) and pulledPage not in pulledPages:
			pulledPages[pulledPage] = None
			nextRound.append(linkUrl)
	for url in nextRound:
		pull(url, matchURL, depth-1, opener)

def urlToPulledPage(url):
	return url.strip("/")

def savePages(matchURL):
	for url, page in pulledPages.items():
		if page is not None:
			updateLinks(page, matchURL, url)
			save(url, page.prettify(), matchURL)

def memoize(f):
	d = {}
	def g(*args):
		if args[0] not in d:
			d[args[0]] = f(*args)
		return d[args[0]]
	return g

@memoize
def save(url, text, matchURL):
	path = urlToPath(url, matchURL)
	savePath = "html/" + path
	folder = os.path.dirname(savePath)
	if not os.path.exists(folder):
		os.makedirs(folder)
	try:
		with open(savePath, 'w') as fh:
			fh.write(text.encode('utf-8'))
	except IOError:
		print folder, savePath
		raise
	return path

def urlToPath(url, matchURL):
	path = url[len(matchURL):]
	if path.endswith("/"):
		path = path[:-1]
	if defaultPath(path):
		path += "/index.html"
	return "." + path

def defaultPath(path):
	for extension in [".js", ".html", ".css"]:
		if path.endswith(extension):
			return False
	return True

def updateLinks(page, matchURL, url):
	for anchor in page.findAll("a", href=True):
		if urlToPulledPage(anchor["href"]) in pulledPages:
			anchor["href"] = relativePath(anchor["href"], matchURL, url)

def relativePath(childUrl, matchURL, parentURL):
	path = urlToPath(parentURL, matchURL)
	count = path.replace('./', '').count('/')-1
	parentDirs = "../" * count
	rP = parentDirs + urlToPath(childUrl, matchURL)
	return rP

def getPage(url, opener):
	html = read(url, opener)
	if html is None: return
	page = BeautifulSoup(html, "lxml")
	return page

def downloadDependencies(page, opener, matchURL, url):
	for js in page.findAll("script", src=True):
		if js['src'].startswith("//"):
			js['src'] = "https:" + js['src']
		js['src'] = downloadDependency(js['src'], opener, matchURL, url)
	for css in page.findAll("link", rel="stylesheet"):
		if css['href'].startswith("//"):
			css['href'] = "https:" + css['href']
		css['href'] = downloadDependency(css['href'], opener, matchURL, url)

def downloadDependency(url, opener, matchURL, parentURL):
	if url.startswith("/"):
		s = parentURL.split("//")
		fetchURL = s[0] + "//" + s[1].split("/")[0] + url
		saveURL = "/".join(parentURL.split("/")[:-1]) + url
	else:
		fetchURL = saveURL = url
	if not saveURL.startswith(matchURL):
		return fetchURL
	text = read(fetchURL, opener)
	path = save(saveURL, text, matchURL)
	rP = relativePath(saveURL, matchURL, parentURL)
	return rP

def read(url, opener):
	try:
		return opener.open(url).read()
	except urllib2.HTTPError:
		print url
		raise


if __name__ == "__main__":
	main()
