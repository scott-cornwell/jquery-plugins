CSSAutoLoad
---

Note: You need to have PreloadJS included or load the file manifest yourself. CSSAutoLoad just collects the file paths
from your CSS based on the instructions you give it if PreloadJS is not present.

Manifest is in the following format:

	[ { id: 'my_file_id', src: 'any_path/my_file.jpg' } ]


Loading all files referenced in CSS on the page:

	$.CSSAutoLoad( { 
		onProgress: function(event) {
		
		},		
		onFileLoad: function(event) {
		
		},		
		onComplete: function(manifest) {
		
		} 
	});
	
Load files referenced in specific CSS files from current page:

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
	
	
