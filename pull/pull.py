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

	options['matchURL'] = "/".join(options['startURL'].split("/")[:-1])
	options['protocol'] = options['startURL'].split('//')[0]

	global opener
	opener = urllib2.build_opener()
	if os.path.isfile(cookieTxt):
		cj = cookielib.MozillaCookieJar(cookieTxt)
		cj.load(cookieTxt, ignore_discard=True, ignore_expires=True)
		opener.add_handler(urllib2.HTTPCookieProcessor(cj))

	pull(options['startURL'], options['depth'])
	savePages()
	print "success!"

def pull(startURL, depth):
	if depth == 0: return
	page = getPage(startURL, depth)
	pulledPages[urlToPulledPage(startURL, None)] = page
	if page is None: return
	downloadDependencies(page, startURL)
	nextRound = []
	for link in page.findAll("a", href=True):
		linkUrl = link["href"].split("?")[0].split("#")[0]
		pulledPage = urlToPulledPage(linkUrl, startURL)
		if pulledPage.startswith(options['matchURL']) and pulledPage not in pulledPages and '@' not in pulledPage:
			pulledPages[pulledPage] = None
			nextRound.append(pulledPage)
	for url in nextRound:
		pull(url, depth-1)

def urlToPulledPage(url, startURL):
	if url.startswith('//'):
		url = options['protocol'] + url
	elif url.startswith('/'):
		url = startURL + url
	return url.strip("/")

def savePages():
	for url, page in pulledPages.items():
		if page is not None:
			updateLinks(page, url)
			save(url, page.prettify())

def memoize(f):
	d = {}
	def g(*args):
		if args[0] not in d:
			d[args[0]] = f(*args)
		return d[args[0]]
	return g

@memoize
def save(url, text):
	path = urlToPath(url)
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

def urlToPath(url):
	path = url[len(options['matchURL']):]
	if path.endswith("/"):
		path = path[:-1]
	if defaultPath(path):
		path = path.strip('/') + "/index.html"
	return path

def defaultPath(path): # TODO
	for extension in [".js", ".html", ".css"] + options['extensions']:
		if path.endswith(extension):
			return False
	return True

def updateLinks(page, url):
	for anchor in page.findAll("a", href=True):
		if urlToPulledPage(anchor["href"], url) in pulledPages:
			anchor["href"] = relativePath(anchor["href"], url)

def relativePath(childUrl, parentURL):
	path = urlToPath(parentURL)
	count = path.replace('./', '').count('/')-1
	parentDirs = "../" * count
	rP = parentDirs + urlToPath(childUrl)
	return rP

def getPage(url, depth):
	print "\t" * (options['depth'] - depth) + url
	html = read(url)
	if html is None: return
	page = BeautifulSoup(html, "lxml")
	return page

def downloadDependencies(page, url):
	for js in page.findAll("script", src=True):
		js['src'] = downloadDependency(js['src'], url)
	for css in page.findAll("link", rel="stylesheet"):
		css['href'] = downloadDependency(css['href'], url)

def downloadDependency(url, parentURL):
	if url.startswith("//"):
		url = options['protocol'] + url
	if url.startswith("/"):
		s = parentURL.split("//")
		fetchURL = s[0] + "//" + s[1].split("/")[0] + url
	elif '//' in url:
		fetchURL = url
	else:
		fetchURL = parentURL + '/' + url
	saveURL = "/".join(parentURL.split("/")[:-1]) + url
	if not fetchURL.startswith(options['matchURL']): return fetchURL
	text = read(fetchURL)
	if text is None: return
	path = save(fetchURL, text)
	rP = relativePath(saveURL, parentURL)
	return rP

def read(url):
	try:
		return opener.open(url).read()
	except urllib2.HTTPError as e:
		print "exception -", url
		print e
		return None


if __name__ == "__main__":
	main()
