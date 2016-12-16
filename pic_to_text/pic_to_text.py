import cv2
import numpy
import os
import sys
import xlwt

sys.path.append('./Pytesser')
import pytesser

BINS_PER_ROW = 9
MIN_RADIUS_FACTOR = 0.4
MAX_RADIUS_FACTOR = 15
RADIUS_VARIATION = 1
CONTRAST_FACTOR = 1
EDGE_THRESHOLD = 100

def main():
	output_path = sys.argv[1] if len(sys.argv) >= 2 else 'output.xlsx'
	image_paths = sys.argv[2:] if False else ['rotated.jpg', 'unrotated.jpg'][:1]
	workbook = xlwt.Workbook()
	for image_path in image_paths:
		sheet = workbook.add_sheet(os.path.basename(image_path).split('.')[0])

		labels = get_labels(image_path)
		for label in labels:
			text = label.get_text()
			label.place_text(text, sheet)
	# workbook.save(output_path)
	

def get_labels(image_path):
	image = cv2.imread(image_path)

	find_circles_image = build_find_circles_image(image)

	expected_radius = image.shape[1] / BINS_PER_ROW / 2
	minRadius = expected_radius * MIN_RADIUS_FACTOR
	maxRadius = expected_radius * MAX_RADIUS_FACTOR

	circle_tuples = cv2.HoughCircles(find_circles_image, cv2.cv.CV_HOUGH_GRADIENT, 1., minRadius, minRadius=int(minRadius), maxRadius=int(maxRadius))

	if circle_tuples is None:
		raise RuntimeError("no circles were found in image %s" % image_path)
	else:
		circle_tuples = circle_tuples[0]
		print circle_tuples

	circles = get_circles(circle_tuples)
	labels = [Label(circle, image) for circle in circles]
	return labels

def build_find_circles_image(image):
	find_circles_image = image
	find_circles_image = cv2.Canny(find_circles_image, EDGE_THRESHOLD, EDGE_THRESHOLD*3) # maybe also denoise
	cv2.imshow('hi', find_circles_image)
	cv2.waitKey(0)
	return find_circles_image

def get_circles(circle_tuples):
	circles = [Circle(t) for t in circle_tuples]
	radii = sorted([c.r for c in circles])
	median_radius = radii[len(radii)/2]
	circles = [c for c in circles if c.good_circle(median_radius)]
	Circle.set_grid_values(circles, median_radius)
	return circles

class Circle(object):
	def __init__(self, t):
		self.x, self.y, self.r = t

	def good_circle(self, median_radius):
		diff_r = abs(self.r - median_radius)
		return diff_r < RADIUS_VARIATION * median_radius

	@staticmethod
	def set_grid_values(circles, median_radius):
		Circle.grid_values = {}
		for d in ['x', 'y']:
			all_points = sorted([getattr(c, d) for c in circles])
			min_val = all_points[0]
			steps = []
			for i in range(len(all_points)-1):
				diff = all_points[i+1] - all_points[i]
				if diff > median_radius:
					steps.append(diff)
			steps.sort()
			median_step = steps[len(steps)/2]
			Circle.grid_values[d] = {
				"min_val": min_val,
				"median_step": median_step,
			}

	def place_in_grid(self):
		self.grid = {}
		for d in Circle.grid_values:
			grid_index = int(round((getattr(self, d) - Circle.grid_values[d]["min_val"]) / Circle.grid_values[d]["median_step"]))
			self.grid[d] = grid_index

class Label(object):
	def __init__(self, circle, image):
		minX = int(circle.x-circle.r)
		maxX = int(circle.x+circle.r)
		minY = int(circle.y-circle.r)
		maxY = int(circle.y+circle.r)
		self.box = image[minX:maxX, minY:maxY]
		self.circle = circle

		self.circle.place_in_grid()

	def get_text(self):
		return pytesser.mat_to_string(self.box, psm=pytesser.PSM_OSD_ONLY)

	def place_text(self, text, sheet):
		sheet.write(self.circle.grid["x"], self.circle.grid["y"], text)

if __name__ == "__main__":
	main()