CSSAutoLoad
---

Loads url() tags in CSS automatically. All CSS, specify CSS, path filters, jQuery CSS selector-based loading. 
Automatically loads with PreloadJS if available, or returns manifest for you to load with your favorite loader. 
Handles @import-ed CSS and webfont CSS files.

Notes: 

* You need to have PreloadJS included or load the file manifest yourself. CSSAutoLoad just collects the file paths
from your CSS based on the instructions you give it if PreloadJS is not present.

* When using jQuery selectors to load their associated resources, only the following tags are currently considered:
    `background-image`, `border-image`, `content`, `cursor`, `src` (if you use `background` to specify image it will 
    still pick it up)

Warning!: Does not currently load resources from CSS that isn't already loaded (when specifying CSS files explicitly)

Manifest is in the following format:

	[ { id: 'my_file_id', src: 'any_path/my_file.jpg' } ]


Loading all files referenced in CSS on the page:

	$.CSSAutoLoad( { 
		onProgress: function(event) {
			//optional, will not fire if PreloadJS isn't included
		},		
		onFileLoad: function(event) {
			//optional, will not fire if PreloadJS isn't included
		},		
		onComplete: function(manifest) {
			//load the manifest with your favorite loader here, or if PreloadJS is included in your page, it
			//will actually be done loading when this is called!
		} 
	});
	
Load files referenced in specific CSS files from current page:
Note: You can specify filters here too.

	$.CSSAutoLoad({ css: ['mycss1.css', 'mycss2.css'], 
			onComplete: function(manifest) {
					
			} 
	});
	
Load all with filters (filters are done with OR)
	
	$.CSSAutoLoad({ filter: ['/mypage/', '.jpg'], 
			onComplete: function(manifest) {
	
			}
	});
	
Selector load (can still use filters, do not specify CSS files though)

	$('#myContainer').children().CSSAutoLoad({ filter: '.jpg', onComplete: function(){} });
	
	
TODO: Handle loading of external CSS not embedded in the current page.

TODO: Detect a few other popular loader plugins and use those when available?
	
	
