.PHONY: build
build: _site

HTML_SOURCES=$(shell find src -type f -name '*.html')
HTML_TARGETS=$(patsubst src/%.html, _site/%.html, $(HTML_SOURCES))

_site: $(HTML_TARGETS) src/*.html src/*.css
	rsync -av src/*.css _site/

_site/%.html: src/%.html src/fragment/* transcluder.js node_modules
	@mkdir -p "$(@D)"
	node transcluder.js $< > $@

node_modules: package.json
	npm install

.PHONY: assets
assets:
	aws s3 sync --acl 'public-read' assets/ s3://nicwaller-public/

forever:
	@#while true; do make build --silent; sleep 1; done
	fswatch -o src/* | xargs -n1 -I% make _site

serve: _site
	@cd _site && python3 -m http.server 8000

dev:
	(trap 'kill 0' SIGINIT; make forever & make serve)

clean:
	rm -rf node_modules package-lock.json
