from bs4 import BeautifulSoup

import urllib2
import sys

urls = ["http://rbnorway.org/t7-frame-data/akuma-t7-frames", "http://rbnorway.org/t7-frame-data/alisa-t7-frames", "http://rbnorway.org/t7-frame-data/asuka-t7-frames", "http://rbnorway.org/t7-frame-data/bob-t7-frames", "http://rbnorway.org/t7-frame-data/bryan-t7-frames", "http://rbnorway.org/t7-frame-data/claudio-t7-frames", "http://rbnorway.org/t7-frame-data/devil-jin-t7-frames", "http://rbnorway.org/t7-frame-data/dragunov-t7-frames", "http://rbnorway.org/t7-frame-data/eddy-t7-frames/", "http://rbnorway.org/t7-frame-data/eliza-t7-frames/", "http://rbnorway.org/t7-frame-data/feng-t7-frames", "http://rbnorway.org/t7-frame-data/gigas-t7-frames", "http://rbnorway.org/t7-frame-data/heihachi-t7-frames", "http://rbnorway.org/t7-frame-data/Hwoarang-t7-frames", "http://rbnorway.org/t7-frame-data/jack7-t7-frames", "http://rbnorway.org/jin-t7-frames/", "http://rbnorway.org/josie-t7-frames/", "http://rbnorway.org/t7-frame-data/katarina-t7-frames", "http://rbnorway.org/t7-frame-data/kazumi-t7-frames", "http://rbnorway.org/t7-frame-data/kazuya-t7-frames", "http://rbnorway.org/t7-frame-data/king-t7-frames", "http://rbnorway.org/t7-frame-data/kuma-t7-frames", "http://rbnorway.org/t7-frame-data/lars-t7-frames", "http://rbnorway.org/law-t7-frames/", "http://rbnorway.org/t7-frame-data/lee-t7-frames", "http://rbnorway.org/t7-frame-data/leo-t7-frames", "http://rbnorway.org/t7-frame-data/lili-t7-frames", "http://rbnorway.org/t7-frame-data/lucky-chloe-t7-frames", "http://rbnorway.org/t7-frame-data/master-raven-t7-frames/", "http://rbnorway.org/t7-frame-data/miguel-t7-frames", "http://rbnorway.org/t7-frame-data/nina-t7-frames", "http://rbnorway.org/t7-frame-data/paul-t7-frames", "http://rbnorway.org/t7-frame-data/shaheen-t7-frames", "http://rbnorway.org/t7-frame-data/steve-t7-frames", "http://rbnorway.org/t7-frame-data/xiaoyu-t7-frames", "http://rbnorway.org/yoshimitsu-t7-frames/"]

def main():
	# url = sys.argv[1]

	# pullFrameData(url)
	for url in urls:
		pullFrameData(url)

def pullFrameData(url):
	data, character = pullFrameDataHelper(url)
	print character, len(data)

	fileName = "data/%s.txt" % character

	with open(fileName, 'w') as fh:
		for move in data:
			line = "%s\t%s\n" % move
			try:
				fh.write(line)
			except Exception as e:
				print e, [line]

def pullFrameDataHelper(url):
	f = urllib2.urlopen(url)
	soup = BeautifulSoup(f, "html.parser")

	specialMoves = soup.find('table')
	data = [getMove(row) for index, row in enumerate(specialMoves.find_all('tr')) if index != 0]

	character = soup.find(class_='title').get_text()[:-len(' T7 Frames')]

	return data, character

def getMove(row):
	command, hitLevel, damage, startUpFrame, blockFrame, hitFrame, counterHitFrame, notes = [cell.get_text().encode('utf-8') for cell in row.find_all('td')]

	term = command
	if notes:
		term += (" (%s)" % notes)

	definitionParts = [startUpFrame, blockFrame, hitFrame]
	if counterHitFrame != hitFrame:
		definitionParts.append(counterHitFrame)
	definition = '.'.join(definitionParts)

	return (term, definition)


if __name__ == "__main__":
	main()