/*
	CSSAutoLoad plugin for jQuery
	
	@author Scott Cornwell, http://www.linkedin.com/pub/scott-cornwell/2/737/44b
	@version 0.1
	@updated 13-JUN-13
	
	
	Note: You need to have PreloadJS included or load the file manifest yourself. CSSAutoLoad just collects the file paths
	from your CSS based on the instructions you give it.

*/


(function ($) {
	$.CreateJSCSSAutoLoadConnector = function(manifest, onProgress, fileLoad, onComplete) {
		var preload = new createjs.LoadQueue(true, '');
		if (fileLoad != null) { preload.addEventListener('fileload', fileLoad); }
		if (onProgress != null) { preload.addEventListener('progress', onProgress); }
		if (onComplete != null) { preload.addEventListener('complete', onComplete); }
		preload.loadManifest(manifest);	
	};
} (jQuery));


(function ($) {
	
	var loadedDictionary = {};
	var loadTotal = 0;
	var loadQueue = [];
	var bLoading = false;
	var bReturned = false;
	
	/* private functions */
	
	function loadNext(ref) {
		if (loadQueue.length > 0 && !bLoading) {
			var nextItem = loadQueue.shift();				
			if (isLoaded(nextItem.src) == false) {
				bLoading = true;
				loadFile(nextItem, ref);
			} else {
				loadNext(ref);
			}
		} else {
			if (bReturned && ref.onComplete != null) {
				var manifest = [];
				for (var key in loadedDictionary) {
					manifest.push(loadedDictionary[key]);
				}
				
				for (var i=0; i < manifest.length; i++) {
					var loadItem = manifest[i];
					var loadMatch = loadItem.src.match(/(^.+?[^\?])(#.*?$)/);
					if (loadMatch != null) {
						loadItem.src = loadMatch[1];
					}
				}
				
				if (createjs && createjs.PreloadJS && $.CreateJSCSSAutoLoadConnector != null) {
					$.CreateJSCSSAutoLoadConnector(manifest, ref.onProgress, ref.onFileLoad, ref.onComplete);
				} else {
					ref.onComplete(manifest);
				}				
			}
		}
	}
	
	function loadFile(item, ref) {
		loadedDictionary[item.src] = item;
		bLoading = false;
		loadNext(ref);		
	}

	function addToQueue(path, ref) {
		if (!isLoaded(path.src)) {
			loadQueue.push(path);
			if (!bLoading) {
				loadNext(ref);
			}
		}		
	}
	
	function getPath(css) {
		var reg = /url\(\s*['"]?(.+?)['"]?\s*\)/gi
		var match = reg.exec(css);
		if (match != null) {
			var imageSrc = match[1];
			var imageId = imageSrc.match(/\/?([^\/]+?$)/);
			imageId = imageId[1];
			return { src: imageSrc, id: imageId };	
		} else {
			return null;
		}
	}
	
	function getPaths(css) {
		var reg = /url\(\s*['"]?(.+?)['"]?\s*\)/gi
		var match;
		var imagePaths = [];
		while (match = reg.exec(css)) {
			var imageSrc = match[1];
			var imageId = imageSrc.match(/\/?([^\/]+?$)/);
			imageId = imageId[1];
			imagePaths.push({ src: imageSrc, id: imageId });
		}
		return imagePaths;
	}
	
	
	function isLoaded(path) {
		return (path in loadedDictionary);
	}
	
	
	//constructor
	var CSSAutoLoad = function(options, target) {
		if (typeof options.filter == 'string') {
			this.filters = [options.filter];
		} else if (typeof options.filter == 'object') {
			this.filters = options.filter;
		} else {
			this.filters = [];
		}
		
		this.onComplete = options.onComplete;
		this.onProgress = options.onProgress;
		this.onFileLoad = options.onFileLoad;
		this.css = options.css;
		this.target = target;
		
		
		if (typeof target !== 'undefined') {
			var tagNames = ["background-image", "cursor", "content", "src"];
			var targetObj = $(target);
			for (var i=0; i < tagNames.length; i++) {
				var tagName = tagNames[i];
				var cssVal = targetObj.css(tagName);
				var cssPath = getPath(cssVal);
				if (cssPath != null) {
					addToQueue(cssPath, this);
				}			
			}
		} else {
			if (this.css) {
				var cssFiles = this.css;
				var cssList = document.styleSheets;
				for (var i=0; i < cssList.length; i++) {
					var sheet = cssList[i];
					var bFoundList = false;
					if (sheet.href != null) {
						for (var j=0; j < cssFiles.length; j++) {
							var cssFile = cssFiles[j];
							if (sheet.href.match(cssFile)) {
								bFoundList = true;
								loadSheet(sheet, this.filters, this);
							}
						}
					}
					if (!bFoundList) {
						//TODO: css is not on page, load external file
						
						
					}
				}
			} else {
				//get all css files
				var cssList = document.styleSheets;
				for (var i=0; i < cssList.length; i++) {
					var sheet = cssList[i];
					if (sheet.href != null) {
						loadSheet(sheet, this.filters, this);
					}
				}
			}
		}
	};
	
	function filterPaths(paths, filters) {
		if (filters.length == 0) { return paths; }
		var outPaths = [];		
		for (var i=0; i < paths.length; i++) {
			var path = paths[i];
			for (var j=0; j < filters.length; j++) {				
				var filter = filters[i];
				if (path.src.match(filter)) {
					outPaths.push(path);
					continue;
				}
			}
		}		
		return outPaths;
	}
	
	function loadSheet(sheet, filters, ref) {
		var rules = sheet.rules;
		for (var j=0; j < rules.length; j++) {
			var rule = rules[j];
			if (rule.href != null) {
				var importRules = rule.styleSheet.cssRules;
				for (var k=0; k < importRules.length; k++) {
					rule = importRules[k];
					var paths = getPaths(rule.cssText);
					paths = filterPaths(paths, filters);
					for (var i=0; i < paths.length; i++) {				
						addToQueue(paths[i], ref);
					}
				}
			} else {
				var paths = getPaths(rule.cssText);
				paths = filterPaths(paths, filters);
				for (i=0; i < paths.length; i++) {
					addToQueue(paths[i], ref);
				}
			}
		}
	}

	//to autoload based on jQuery selectors 
	$.fn.CSSAutoLoad = function(options) {
		var instance;
		var result = this.each(function() {
			instance = new CSSAutoLoad(options, this);
        });	
		bReturned = true;
		loadNext(instance);			
		
		return result;
	};
	
	//to call CSSAutoLoad directly 
	$.CSSAutoLoad = function(options) {
		var instance = new CSSAutoLoad(options);
		bReturned = true;
		loadNext(instance);
		return instance;		
	};
	
} (jQuery));

