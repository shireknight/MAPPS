/*********************

	MAPP.js

	Author: Ben Valentine
	Dependencies: HTML5, jQuery, jQuery UI, jQuery Flippy

	Note: MAPP widgets are listed in order of use

**********************\*/



;(function($, window, document, undefined){



	/************************
		GLOBALS
	*************************/

	// global reference to browser local storage

	$.Storage = (storage = window.localStorage);

	// create MAPP as new global namespace

	$.MAPP = {

		self: this,

		selectedItems: [],

		// saves the selected items to localStorage
		saveSelectedItems: function(){
			var self = this;
			if(self.selectedItems.length > 1){
				for(var i=0; i<self.selectedItems.length; i++){
					$.Storage.setItem(i, self.selectedItems[i]);
				}
			}
			return true;
		},

		// gets stored items and adds them to selectedItems[]
		getSelectedItems: function(){
			var selectedItems = [];
			for(i=0; i < $.Storage.length; i++){
				var item = $.Storage.getItem(i);
				selectedItems.push(item);
			}
			return selectedItems;
		},

		removeSelectedItem: function(itemName){
			var self = this;
			//x -= 1;
			var pos = $.inArray(itemName, self.selectedItems);
			// '~' is the same as 'pos >= -1'
			if( ~pos ) self.selectedItems.splice(pos, 1);

			var sPos = $.inArray(itemName, $.Storage);
			if( ~ sPos ) $.Storage.removeItem(sPos);
			return true;
		},

		clearSelectedItems: function(){
			$.Storage.clear();
			return true;
		},


		


	};

	/* method appends saved items to DOM element */
	$.fn.loadMAPP = function(){
		var $self = $(this);
		var selectedItems = $.MAPP.getSelectedItems();
		$.each(selectedItems, function(k, v){
			if( v != undefined || v != null ){
				// creates the HTML to append to the container
				var imgTitle = v;
				// replace spaces with underscores
				imgTitle = imgTitle.replace(" ", "-");
				var imgSrc = 'img/icons/' + imgTitle + '.png';
				var img = $('<img />', { 'src': imgSrc, 'alt': imgTitle });
        		var a = $('<a />', { 'href': '#' }).append(img);
        		var li = $('<li />').append(a);
				$self.append(li);
				$.MAPP.selectedItems[k] = imgTitle;
			}
		});
		return true;
	};

	/************************ 
		UI WIDGETS 
	*************************/


	$.widget('MAPP.MappDialog', {

		options: {
			title: '<i class="fa fa-question-circle"></i>What is a MAPP?',
			open: function(event, ui) {
				var icon = $('<i/>', { class: 'fa fa-times' })  
				$('.ui-dialog-titlebar-close').text('').append(icon);  
			},
			closeOnEscape: true,
			modal: true
		},
	
		_create: function(){
			self = this, el = this.element, o = this.options;
			self.inst = $.data('MAPPDialog', this.widgetName);
			// hide it off the bat
			el.hide();
			$('a#about').bind('click', function(e){
				e.preventDefault();
				el.dialog(o);
			});
		}
	
	}); // end MAPPDialog widget


	$.widget('MAPP.MappMaker', {

		count : 0,
	
		_create: function(){
			self = this, el = this.element, o = this.options;
			self.inst = $.data('MappMaker', this.widgetName);
			var $containerNav = $('nav#container');
			var $iconSection = $('section#icons');

			self.icons = $iconSection.find('ul');
			//self.icons = $iconSection.find('ul').find('li');
			self.container = $containerNav.find('ul');

			$(self.container).loadMAPP();
			
			// re-adjust the count if we have items in there already
			self.containerList = self.container.find('li'); 
			self.count += self.containerList.length;

			//if(self.count > 0) self._initSelected();

			/*
			self.container.sortable({
				zIndex: 9999,
				placeholder: 'ui-sortable-placeholder',
				revert: true
			});
			
			self.icons.draggable({
				snap : self.container,
				revert : 'invalid',
				helper: 'clone',
				zIndex: 9999
			});

			self.container.droppable({
				accept: self.icons,
				tolerance: 'intersect',
				drop: function(e, ui){
					var $clone = $($(ui.draggable).clone());
					$clone.css({ 'top': '0', 'left': '0' }).appendTo(this);
					//self._mkDraggableOnDrop($clone);
					var imgAlt = $clone.find('img').attr('alt');
					// saving clone to window.localStorage
					self._saveAsSelected($clone);
					self.count++;
					self.container.push($clone.html());
				}
			});

			self.container.draggable({
				revert: function(valid) {
			        if(!valid) {
			            //Dropped outside of valid droppable
			            this.remove();

						self._removeFromLocalStorage();
						self.count--; 
					}
    			},
				helper: 'clone',
				scroll: 'false',
				zIndex: 9999	 
			});

			self.icons.bind('doubletap dblclick', function(e){
				e.preventDefault();
				var $clone = $($(this).clone());
				$clone.appendTo(self.container);
				//self._mkDraggableOnDrop($clone);
				self.count++;
				self._saveAsSelected($clone);
			});

*/
			
			self.icons.sortable({ 
				connectWith: self.container,
				helper: 'clone'
			});

			self.container.sortable({
				connectWith: self.icons,
				helper: 'clone',
				update: function(e, ui){
					var source = $(ui.sender).parent().attr('id');
					if(source == "icons"){
						self._saveAsSelected(ui.item);
						self.count++;
					}
				},
				remove: function(e, ui){
					var itemName = $(ui.item).find('img').attr('alt');
					self._removeItem(itemName);
					// redefine self.count
					self.count--;
				}
			});

		},


		/* make selected items removable after they've been loaded */
		_initSelected: function(){
			$.each(self.containerList, function(){
				self._mkDraggableOnDrop($(this));
			});	
		},

		/* after a drop make items in the container removable */
		_mkDraggableOnDrop: function($clone){
			$clone.draggable({
				zIndex: 9999,
				revert: function(droppable){
					if(droppable === false){
						$(this).remove();
						self._removeFromLocalStorage();
						self.count--; 
						return true;
					}else{
						return false;
					}
				}
			});

			return true;
		},


		_saveAsSelected: function($clone){
			var imgAlt = $clone.find('img').attr('alt');
			$.MAPP.selectedItems[self.count] = imgAlt;
			return true;
		},

		/*
		_removeFromLocalStorage: function(){
			$.MAPP.removeSelectedItem(self.count);
			return true;
		},
		*/

		_removeItem: function(itemName){
			$.MAPP.removeSelectedItem(itemName);
			return true;
		},

		destroy: function(){
			if($.MAPP.selectedItems.length > 0){
				$.MAPP.saveSelectedItems();
			}
			return true;
		}

	
	}); // end MAPPMaker widget

	
	$.widget('MAPP.MappViewer', {

		options: {
			startAt: 0,
		},

		_create: function(){
			self = this, el = this.element, o = this.options;
			self.inst = $.data('MappViewer', this.widgetName);
			$(el.find('ul')).loadMAPP();

			self.imgStack = el.find('li');
			self._setZIndex();
			cardNum = o.startAt, touches = 0;
			self.imgStack.bind('touch click', function(e){
				e.preventDefault();
				var topCard = $(self.imgStack[cardNum]);
				var nextCard = $(self.imgStack[cardNum++]);
				self._flipToNext(topCard, nextCard);
				touches++;
			});


		},


		_setZIndex: function(){
			// set max z index
			var zIndex = self.imgStack.length * 10;
			// apply styles
			for(i = 0; i < self.imgStack.length; i++){
				var c = $(self.imgStack[i]);
				c.css({ 'z-index' : zIndex });
				// decrement each z index by 10
				zIndex -= 10;
				// if its not the top card, hide it
				if( i == o.startAt ){
					c.show();	
				}
			}

			return true;
		},

		_flipToNext: function(topCard, nextCard){

			// call the flippy plugin
			topCard.flippy({
				direction: 'RIGHT',
				duration: '300',
				depth: '0.12',
				verso: nextCard,
				onMidway: function(){
					nextCard.show().clone();
				},
			});

			return true;
		}

	});
	



})(jQuery, window, document, undefined);


