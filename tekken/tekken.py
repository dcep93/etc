from bs4 import BeautifulSoup

import urllib2
import sys

def main():
	url = sys.argv[1]

	data, character = pullFrameData(url)

	fileName = "data/%s.txt" % character

	with open(fileName, 'w') as fh:
		for move in data:
			line = "%s\t%s\n" % move

			fh.write(line)

def pullFrameData(url):
	f = urllib2.urlopen(url)
	soup = BeautifulSoup(f, "html.parser")

	specialMoves = soup.find('table')
	data = [getMove(row) for index, row in enumerate(specialMoves.find_all('tr')) if index != 0]

	character = soup.find(class_='title').get_text()[:-len(' T7 Frames')]

	return data, character

def getMove(row):
	command, hitLevel, damage, startUpFrame, blockFrame, hitFrame, counterHitFrame, notes = [str(cell.get_text()) for cell in row.find_all('td')]

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