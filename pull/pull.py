from bs4 import BeautifulSoup
import cookielib
import os
import urllib2
import sys

pulledPages = {}
options = {}

def main():
	options['startURL'] = sys.argv[1]
	options['depth'] = int(sys.argv[2]) if len(sys.argv) > 2 else 1
	options['extensions'] = sys.argv[2:]
#	cookieTxt = sys.argv[3] if len(sys.argv) > 3 else ""
	cookieTxt = ""

	matchURL = "/".join(startURL.split("/")[:-1])
	if len(sys.argv) > 2 and sys.argv[2] == "-":
		s = matchURL.split("//")
		matchURL = s[0] + "//" + s[1].split("/")[0]

	opener = urllib2.build_opener()
	if os.path.isfile(cookieTxt):
		cj = cookielib.MozillaCookieJar(cookieTxt)
		cj.load(cookieTxt, ignore_discard=True, ignore_expires=True)
		opener.add_handler(urllib2.HTTPCookieProcessor(cj))

	pull(options['startURL'], matchURL, depth, opener, extensions)
	savePages(startURL, extensions)
	print "success!"

def pull(startURL, matchURL, depth, args):
	if depth == 0: return
	page = getPage(startURL, depth, options)
	pulledPages[urlToPulledPage(startURL, None)] = page
	if page is None: return
	downloadDependencies(page, opener, matchURL, startURL, extensions)
	nextRound = []
	for link in page.findAll("a", href=True):
		linkUrl = link["href"].split("?")[0].split("#")[0]
		pulledPage = urlToPulledPage(linkUrl, startURL)
		if pulledPage.startswith(matchURL) and pulledPage not in pulledPages and '@' not in pulledPage:
			pulledPages[pulledPage] = None
			nextRound.append(pulledPage)
	for url in nextRound:
		pull(url, matchURL, depth-1, args)

def urlToPulledPage(url, startURL):
	if url.startswith('//'):
		url = 'http:' + url
	if url.startswith('/'):
		url = startURL + '/' + url
	return url.strip("/")

def savePages(matchURL, extensions):
	for url, page in pulledPages.items():
		if page is not None:
			updateLinks(page, matchURL, url, extensions)
			save(url, page.prettify(), matchURL, extensions)

def memoize(f):
	d = {}
	def g(*args):
		if args[0] not in d:
			d[args[0]] = f(*args)
		return d[args[0]]
	return g

@memoize
def save(url, text, matchURL, extensions):
	path = urlToPath(url, matchURL, extensions)
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

def urlToPath(url, matchURL, extensions):
	path = url[len(matchURL):]
	if path.endswith("/"):
		path = path[:-1]
	if defaultPath(path, extensions):
		path += "/index.html"
	return "." + path

def defaultPath(path, extensions):
	for extension in [".js", ".html", ".css"] + extensions:
		if path.endswith(extension):
			return False
	return True

def updateLinks(page, matchURL, url, extensions):
	for anchor in page.findAll("a", href=True):
		if urlToPulledPage(anchor["href"], url) in pulledPages:
			anchor["href"] = relativePath(anchor["href"], matchURL, url, extensions)

def relativePath(childUrl, matchURL, parentURL, extensions):
	path = urlToPath(parentURL, matchURL, extensions)
	count = path.replace('./', '').count('/')-1
	parentDirs = "../" * count
	rP = parentDirs + urlToPath(childUrl, matchURL, extensions)
	return rP

def getPage(url, depth, args):
	print "  " * (args['maxdepth'] - depth) + url
	html = read(url, args)
	if html is None: return
	page = BeautifulSoup(html, "lxml")
	return page

def downloadDependencies(page, opener, matchURL, url, extensions):
	for js in page.findAll("script", src=True):
		if js['src'].startswith("//"):
			js['src'] = "http:" + js['src']
		js['src'] = downloadDependency(js['src'], opener, matchURL, url, extensions)
	for css in page.findAll("link", rel="stylesheet"):
		if css['href'].startswith("//"):
			css['href'] = "http:" + css['href']
		css['href'] = downloadDependency(css['href'], opener, matchURL, url, extensions)

def downloadDependency(url, opener, matchURL, parentURL, extensions):
	if url.startswith("/"):
		s = parentURL.split("//")
		fetchURL = s[0] + "//" + s[1].split("/")[0] + url
		saveURL = "/".join(parentURL.split("/")[:-1]) + url
	else:
		fetchURL = saveURL = url
	if not saveURL.startswith(matchURL):
		return fetchURL
	text = read(fetchURL, opener)
	if text is None: return
	path = save(saveURL, text, matchURL, extensions)
	rP = relativePath(saveURL, matchURL, parentURL, extensions)
	return rP

def read(url, opener):
	try:
		return opener.open(url).read()
	except urllib2.HTTPError as e:
		print "exception -", url
		print e
		return None


if __name__ == "__main__":
	main()
