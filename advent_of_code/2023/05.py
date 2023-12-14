
with open('05.txt') as fh:
    txt = fh.read()

def part1():
    lines = txt.split("\n")
    seeds = [int(i) for i in lines[0].split(": ")[1].split(" ")]
    maps_text = txt.split("\n\n")
    maps = {}
    for map_data in maps_text[1:]:
        data = map_data.split("\n")
        source, target = data[0].split(" ")[0].split("-to-")
        conversions = [[int(i) for i in line.split(" ")] for line in data[1:]]
        maps[source] = {"conversions": conversions, "target": target}
    def pipe(value, source):
        if source == "location":
            return value
        info = maps[source]
        converted_value = value
        for conversion in info["conversions"]:
            diff = value - conversion[1]
            if diff >= 0 and diff < conversion[2]:
                converted_value = conversion[0] + diff
                break
        return pipe(converted_value, info["target"])


    print(min([pipe(seed, "seed") for seed in seeds]))


def part2():
    lines = txt.split("\n")
    raw_seeds = [int(i) for i in lines[0].split(": ")[1].split(" ")]
    seeds = []
    for index in range(int(len(raw_seeds) / 2)):
        seeds += [[raw_seeds[2*index], raw_seeds[2*index] + raw_seeds[2*index+1] - 1]]
    maps_text = txt.split("\n\n")
    maps = {}
    for map_data in maps_text[1:]:
        data = map_data.split("\n")
        source, target = data[0].split(" ")[0].split("-to-")
        conversions = [[int(i) for i in line.split(" ")] for line in data[1:]]
        maps[source] = {"conversions": conversions, "target": target}

    def pipe(input_values, source):
        if source == "location":
            return min([i[0] for i in input_values])
        info = maps[source]
        output_values = []
        for i in input_values:
            to_converts = [i]
            for c_target_offset, c_source_offset, c_range in info["conversions"]:
                c_ceiling = c_source_offset + c_range - 1
                next_to_converts = []
                for source_floor, source_ceiling in to_converts:
                    if source_floor < c_source_offset:
                        next_to_converts += [[source_floor, min(source_ceiling, c_source_offset-1)]]
                    if source_ceiling >= c_source_offset:
                        if source_floor < c_ceiling:
                            output_values += [[i + c_target_offset - c_source_offset for i in [max(c_source_offset, source_floor), min(source_ceiling, c_ceiling)]]]
                        if source_ceiling > c_ceiling:
                            next_to_converts += [[max(c_ceiling+1, source_floor), source_ceiling]]
                to_converts = next_to_converts
            output_values += to_converts
        return pipe(output_values, info["target"])

    print(pipe(seeds, "seed"))

part2()
