var client_id = require('./config').client_id;

var instructions = `

set -e

function fail() {
	echo $@ >&2
	exit 1
}

function get_code() {
	USER=$1

	echo -n "password for $USER: " > /dev/tty
	read -s PASSWORD < /dev/tty
	echo > /dev/tty

	SESSION=$(curl -s -X POST -d "user=$USER&passwd=$PASSWORD" -A reddit_saver -c - https://www.reddit.com/api/login/$USER | grep reddit_session | awk '{print $7}')
	[[ -n $SESSION ]] || fail password incorrect
	UH=$(curl -s -A reddit_saver -H "cookie: reddit_session=$SESSION" https://www.reddit.com/api/v1/authorize | xmllint --html --xpath 'string((//input[@name="uh"])[last()]/@value)' - 2>/dev/null)
	[[ -n $UH ]] || fail error collecting 'uh'

	CODE=$(curl -s -X POST -d "client_id=$CLIENT_ID&redirect_uri=http://localhost:8080&scope=history%20save%20identity&state=_&response_type=code&duration=permanent&uh=$UH&authorize=allow" -D - -A reddit_saver -H "cookie: reddit_session=$SESSION" https://www.reddit.com/api/v1/authorize | grep location | awk -F code= '{print $2}' | tr -d '\\r')
	[[ -n $CODE ]] || fail error retrieving code

	echo $CODE
}

function get_child() {
	USER=$1

	CODE=$(get_code $USER)

	NSFW=$(get_nsfw)

	echo \{ \\"code\\" : \\"$CODE\\", \\"nsfw\\": $NSFW \}
}

function get_nsfw() {
	echo -n "allow nsfw? (y/n) " > /dev/tty
	read RESPONSE < /dev/tty
	CHAR="$\{RESPONSE:0:1\}"
	( [[ $CHAR =~ y ]] && echo true ) || ( [[ $CHAR =~ n ]] && echo false ) || ( echo "sorry, I didn't get that" > /dev/tty && echo $(get_nsfw) )
}

function get_children() {
	echo \[$(get_children_helper '')\]
}

function join() {
	PREVIOUS=$1
	NEW=$2

	[[ -z "$NEW" ]] && echo "$PREVIOUS" || [[ -z "$PREVIOUS" ]] && echo "$NEW" || echo "$PREVIOUS,$NEW"
}

function get_children_helper() {
	PREVIOUS_CHILDREN=$1
	echo -n "enter child username (blank to stop): " > /dev/tty
	read CHILD < /dev/tty
	[[ -z "$CHILD" ]] && echo $PREVIOUS_CHILDREN || echo $(get_children_helper "$(join "$PREVIOUS_CHILDREN" "$(get_child $CHILD)")")
}

which xmllint > /dev/null || fail 'xmllint not installed - try \`apt-get install libxml2-utils\`'

echo -n "reddit username: "
read USER < /dev/tty

CODE=$(get_code $USER)
CHILDREN=$(get_children)

{
	set -x
	curl -X POST -H "Content-Type: application/json" -d "{\\"code\\": \\"$CODE\\", \\"children\\": $CHILDREN}" $HOST
}
`
	.replace('$CLIENT_ID', client_id)
	.replace(/#.*/g, '')
	.replace(/\t/g, '')
	.replace(/\{\n+/g, '{ ')
	.replace(/\n+\}/g, '; }')
	.replace(/^\n+/g, '( ')
	.replace(/\n+$/g, ' )')
	.replace(/\n+/g, ' && ');

module.exports = function(host) {
	return instructions.replace('$HOST', host);
};
