import cv2
import os
import sys
import xlwt

sys.path.append('./Pytesser')
import pytesser

BINS_PER_ROW = 9
MIN_RADIUS_FACTOR = 0.4
MAX_RADIUS_FACTOR = 1.4
RADIUS_VARIATION = 0.2

def main():
	output_path = sys.argv[1] if len(sys.argv) >= 2 else 'output.xlsx'
	image_paths = sys.argv[2:] if False else ['unrotated.jpg', 'rotated.jpg']
	workbook = xlwt.Workbook()
	for image_path in image_paths:
		sheet = workbook.add_sheet(os.path.basename(image_path).split('.')[0])

		labels = get_labels(image_path)
		for label in labels:
			text = label.get_text()
			label.place_text(text, sheet)
	# workbook.save(output_path)

def show(image):
	cv2.imshow('image', image)
	cv2.waitKey(0)
	cv2.destroyAllWindows()

def get_labels(image_path):
	image = cv2.imread(image_path)
	image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

	expected_radius = image.shape[1] / BINS_PER_ROW
	minRadius = expected_radius * MIN_RADIUS_FACTOR
	maxRadius = expected_radius * MAX_RADIUS_FACTOR

	# circle_tuples = cv2.HoughCircles(image, cv2.cv.CV_HOUGH_GRADIENT, 1., minRadius)[0]
	circle_tuples = [[528.5, 265.5, 32.96210098], [622.5, 257.5, 43.61765671], [156.5, 265.5, 46.50268936], [444.5, 256.5, 32.59601212], [170.5, 343.5, 61.95562744], [535.5, 159.5, 31.69384766], [258.5, 261.5, 47.62877274], [64.5, 371.5, 45.52471924], [151.5, 549.5, 45.30452347], [346.5, 553.5, 44.63742828], [446.5, 178.5, 42.36153793], [165.5, 177.5, 45.03887177], [634.5, 171.5, 33.86000443], [545.5, 222.5, 64.90377808], [720.5, 252.5, 32.87096024], [291.5, 228.5, 96.85298157], [335.5, 232.5, 59.90409088], [260.5, 169.5, 40.52776718], [730.5, 168.5, 31.69384766], [329.5, 278.5, 72.18379211], [159.5, 645.5, 45.39273071], [259.5, 542.5, 43.22615051], [172.5, 488.5, 105.87020111], [372.5, 381.5, 157.24662781], [252.5, 399.5, 143.57054138], [441.5, 632.5, 44.0511055], [817.5, 174.5, 31.94526482], [516.5, 198.5, 61.58327866], [334.5, 502.5, 158.77185059], [295.5, 377.5, 212.02005005], [301.5, 451.5, 158.56387329], [537.5, 379.5, 227.51373291], [369.5, 471.5, 207.20159912], [245.5, 449.5, 193.48513794], [255.5, 646.5, 45.39273071], [219.5, 498.5, 98.16567993], [120.5, 498.5, 108.2243042], [718.5, 543.5, 45.12759781], [453.5, 297.5, 49.11720657], [78.5, 287.5, 39.22371674], [350.5, 174.5, 43.98295212], [349.5, 645.5, 44.14181519], [435.5, 480.5, 205.81181335], [403.5, 443.5, 207.77511597], [419.5, 380.5, 195.4597168], [332.5, 423.5, 210.81390381], [501.5, 506.5, 184.75524902], [144.5, 444.5, 131.30308533], [444.5, 217.5, 71.01055908], [672.5, 222.5, 91.22773743], [200.5, 265.5, 71.13719177], [602.5, 111.5, 176.97598267], [353.5, 91.5, 163.23756409], [471.5, 450.5, 212.84384155], [520.5, 416.5, 209.14707947], [281.5, 588.5, 82.92466736], [282.5, 492.5, 194.94743347], [251.5, 345.5, 87.7410965], [397.5, 498.5, 206.006073], [600.5, 392.5, 248.91062927], [580.5, 502.5, 266.82296753], [534.5, 452.5, 197.78903198], [185.5, 451.5, 172.51811218], [287.5, 415.5, 167.41116333], [107.5, 456.5, 86.64006042], [59.5, 637.5, 51.30789566], [305.5, 99.5, 214.50524902], [116.5, 726.5, 142.69723511], [582.5, 580.5, 117.30516052], [26.5, 465.5, 142.70423889], [646.5, 354.5, 186.67753601], [695.5, 385.5, 129.84799194], [231.5, 110.5, 145.95376587], [563.5, 645.5, 32.81005859], [332.5, 384.5, 186.42022705], [476.5, 381.5, 248.50050354], [83.5, 488.5, 109.34577942], [73.5, 925.5, 41.50301361], [640.5, 413.5, 209.00358582], [574.5, 361.5, 106.81057739], [606.5, 449.5, 204.47616577], [464.5, 79.5, 261.92077637], [606.5, 212.5, 82.53787231], [452.5, 416.5, 269.58950806], [439.5, 125.5, 88.86225128], [169.5, 117.5, 157.43728638], [584.5, 76.5, 218.97146606], [178.5, 705.5, 96.44947052], [782.5, 368.5, 216.25563049], [732.5, 355.5, 191.5528717], [115.5, 567.5, 55.52026749], [534.5, 84.5, 264.60253906], [246.5, 723.5, 58.38235855], [173.5, 808.5, 141.50794983], [136.5, 315.5, 76.30530548], [624.5, 505.5, 201.47579956], [243.5, 590.5, 69.11222839], [643.5, 101.5, 202.81149292], [433.5, 721.5, 139.71578979], [534.5, 303.5, 56.62596512]]

	if circle_tuples is None:
		raise RuntimeError("no circles were found in image %s" % image_path)

	circles = get_circles(circle_tuples)

	for circle in circles:
		minX = int(circle.x-circle.r)
		maxX = int(circle.x+circle.r)
		minY = int(circle.y-circle.r)
		maxY = int(circle.y+circle.r)
		box = image[minX:maxX, minY:maxY]

		circle.place_in_grid()
		yield Label(box, circle.grid)

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
	def __init__(self, box, grid):
		self.box = box
		self.grid = grid

	def get_text(self):
		return pytesser.mat_to_string(self.box, psm=pytesser.PSM_OSD_ONLY)

	def place_text(self, text, sheet):
		sheet.write(self.grid["x"], self.grid["y"], text)

if __name__ == "__main__":
	main()