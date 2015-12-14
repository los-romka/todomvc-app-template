(function(window, $, Promise, dust, Router) {
	'use strict';

	TodoApplication().init();

	/* application */
	function TodoApplication() {
		if (!(this instanceof TodoApplication)) {
			return new TodoApplication();
		}

        var KEY = {
            ENTER: 13,
            ESC: 27
        };

		var TEMPLATE = {
			TODO: 'todo-template',
			FOOTER: 'todo-footer-template'
		};

        var SELECTOR = {
			LOADING: '.overlay-loading',
			MAIN: '.main',
			HEADER: '.header',
			FOOTER: '.footer',

			NEW_TODO: '.new-todo',
			TODO_LIST: '.todo-list',
			TOGGLE_ALL: '.toggle-all',
			CLEAR_COMPLETED: '.clear-completed',

			TODO_TITLE: 'label',
			TODO_WRAPPER: 'li',
			TODO_EDIT: '.edit',
			TODO_TOGGLE: '.toggle',
			TODO_DESTROY: '.destroy'

        };

		var FILTER = {
			ALL: '',
			ACTIVE: 'active',
			COMPLETED: 'completed'
		};

		var self = $.extend(this, {
			todoRepository: TodoRepository(),
			init: init,
			render: render
		});

		return self;

		function init() {
			/* load templates with Dust Templating Engine */
			loadTemplates();

			$(SELECTOR.LOADING).addClass('active');

			/* find all todos */
			self.todos = [];
			self.todoRepository.findAll().then(function(data) {
				self.todos = data;
				$(SELECTOR.LOADING).removeClass('active');
			}, consoleLog).then(function() {
				/* init routing with Director Router */
				Router({
					'/?((\w|.)*)': function(filterRaw) {
						self.filter = correctFilter(filterRaw);
						self.render();
					}
				}).init("/");

				/* bind events */
				bindEvents();
			});
		}

		function loadTemplates() {
			try {
				Object.keys(TEMPLATE).map(function(name) {
					var id = TEMPLATE[name];
					var src = $('#' + id).html();
					var compiled = dust.compile(src, id);
					dust.loadSource(compiled);
				});
			} catch (e) {
				consoleLog('Can\'t load templates!');
			}
		}

		function bindEvents() {
            $(SELECTOR.NEW_TODO).on('keyup',create);
            $(SELECTOR.TOGGLE_ALL).on('change', toggleAll);

			$(SELECTOR.FOOTER).on('click', SELECTOR.CLEAR_COMPLETED, destroyCompleted);

            $(SELECTOR.TODO_LIST)
				.on('click', SELECTOR.TODO_TITLE, attachCaretPosition)
                .on('dblclick', SELECTOR.TODO_TITLE, edit)
                .on('keyup focusout', SELECTOR.TODO_EDIT, update)
                .on('change', SELECTOR.TODO_TOGGLE, toggle)
                .on('click', SELECTOR.TODO_DESTROY, destroy);
		}

		function render() {
            var todoCount = self.todos.length;
            var activeTodoCount = getActiveTodos().length;
            var filteredTodos = getFilteredTodos();

            /* main */
            $(SELECTOR.MAIN).toggle(filteredTodos.length > 0);
            $(SELECTOR.TOGGLE_ALL).prop('checked', activeTodoCount === 0);
            $(SELECTOR.NEW_TODO).focus();

			dust.render(TEMPLATE.TODO, filteredTodos, function(err, out) {
				$(SELECTOR.TODO_LIST).html(out);
			});

            /* footer */
			dust.render(TEMPLATE.FOOTER, {
                activeCount: activeTodoCount,
				itemsLeft: pluralizeItemsLeft(activeTodoCount),
				completedCount: todoCount - activeTodoCount,
				filter: self.filter
			}, function(err, out) {
				$(SELECTOR.FOOTER).toggle(todoCount > 0).html(out);
			});
		}

		function correctFilter(filter) {
			var filterValues = Object.keys(FILTER).map(function(key){ return FILTER[key]; });

			if (filterValues.indexOf(filter) >= 0) {
				return filter;
			}

			return FILTER.ALL;
		}

		function getFilteredTodos() {
			if (self.filter === FILTER.ACTIVE) {
				return getActiveTodos();
			}

			if (self.filter === FILTER.COMPLETED) {
				return getCompletedTodos();
			}

			return self.todos;
		}

		function getCompletedTodos() {
			return self.todos.filter(function(todo) {
				return !!todo.completed;
			});
		}

		function getActiveTodos() {
			return self.todos.filter(function(todo) {
				return !todo.completed;
			});
		}

        function edit(e) {
			var $title = $(e.target);
            var $wrapper = $title.closest(SELECTOR.TODO_WRAPPER);
            var $input = $wrapper.find(SELECTOR.TODO_EDIT);

			$wrapper.addClass('editing');

			/* prettify selection */
			if ($input[0].setSelectionRange) {
				var offset = $title.data('caret-position');
				$input[0].setSelectionRange(offset, offset);
				$title.removeData('caret-position');
			} else {
				$input.val($input.val());
			}

            $input.focus();
        }

        function update(e) {
			var key = e.which;
			var input = e.target;

			/* discard changes */
			if (KEY.ESC === key) {
				self.render();
				return;
			}

			/* if not event of applying */
			if (KEY.ENTER !== key && e.type !== "focusout") {
				return;
			}

			var title = input.value.trim();

			/* destroy if empty */
			if (title === "") {
				destroy(e);
				return;
			}

            var $element = $(input).closest(SELECTOR.TODO_WRAPPER);
			var index = getTodoIndex(input);
			var todo = self.todos[index];

            $element.removeClass('editing');

            self.todoRepository
                .changeTitle(todo.id, title)
                .then(function() {
					todo.title = title;
                    self.render();
                }, consoleLog);
        }

        function create(e) {
            var input = e.target;
            var key = e.which;
            var title = input.value.trim();

            if (KEY.ENTER !== key || !title) {
                return;
            }

            self.todoRepository
                .create(title)
                .then(function(todo) {
                    input.value = "";
                    self.todos.push(todo);
                    self.render();
                }, consoleLog);
        }

        function toggleAll(e) {
            var todos = self.todos;
			var isChecked = $(e.target).prop('checked');
            var ids = $.map(todos, function(todo) { return todo.id });

            self.todoRepository
                .changeCompleteness(ids, isChecked)
                .then(function() {
					/* toggle only needed */
                    todos.forEach(function(todo) {
						if (ids.indexOf(todo.id) >= 0) {
							todo.completed = isChecked;
						}
                    });

                    self.render();
                }, consoleLog);
        }

		function toggle(e) {
			var index = getTodoIndex(e.target);
			var todo = self.todos[index];
            var toggledCompleteness = !todo.completed;

			self.todoRepository
				.changeCompleteness(todo.id, toggledCompleteness)
				.then(function() {
                    todo.completed = toggledCompleteness;
					self.render();
				}, consoleLog);
		}

		function destroy(e) {
			var index = getTodoIndex(e.target);
            var todo = self.todos[index];

			self.todoRepository
				.destroy(todo.id)
				.then(function() {
					/* recalculate index cause async */
					index = getTodoIndex(e.target);

					self.todos.splice(index, 1);
					self.render();
				}, consoleLog);
		}

		function destroyCompleted() {
			var completedTodos = getCompletedTodos();
            var ids = $.map(completedTodos, function(todo) { return todo.id });

			self.todoRepository.destroy(ids).then(function() {
				self.todos = getActiveTodos();
				self.render();
			}, consoleLog);
		}

		function getTodoIndex(element) {
			var nodeId = $(element).closest(SELECTOR.TODO_WRAPPER).data('id');
			var todos = self.todos;

			for (var i = 0; i < todos.length; i++) {
				if (nodeId === todos[i].id) {
					return i;
				}
			}
		}

		function pluralizeItemsLeft(count) {
			return 'item' + (count === 1 ? '' : 's') +  ' left';
		}

		function attachCaretPosition(e){
			var $title = $(e.target);

			if ($title.data('caret-position')) {
				e.stopPropagation();
				e.preventDefault();
				return false;
			}

			$title.data('caret-position', getMouseEventCaretRange(e).endOffset);
		}

		/* src: http://stackoverflow.com/questions/12920225/text-selection-in-divcontenteditable-when-double-click */
		function getMouseEventCaretRange(evt) {
			var range, x = evt.clientX, y = evt.clientY;

			// Try the simple IE way first
			if (document.body.createTextRange) {
				range = document.body.createTextRange();
				range.moveToPoint(x, y);
			}

			else if (typeof document.createRange != "undefined") {
				// Try Mozilla's rangeOffset and rangeParent properties,
				// which are exactly what we want
				if (typeof evt.rangeParent != "undefined") {
					range = document.createRange();
					range.setStart(evt.rangeParent, evt.rangeOffset);
					range.collapse(true);
				}

				// Try the standards-based way next
				else if (document.caretPositionFromPoint) {
					var pos = document.caretPositionFromPoint(x, y);
					range = document.createRange();
					range.setStart(pos.offsetNode, pos.offset);
					range.collapse(true);
				}

				// Next, the WebKit way
				else if (document.caretRangeFromPoint) {
					range = document.caretRangeFromPoint(x, y);
				}
			}

			return range;
		}

		function consoleLog(data) {
			console.log(data);
		}
	}

	/* repository */
	function TodoRepository() {
		return {
			findAll: function() {
				return new Promise(function(resolve, reject) {
					var data = [
						{id:1, title: 'Taste JavaScript', completed: true},
						{id:2, title: 'Buy a unicorn', completed: false},
						{id:3, title: 'Buy another unicorn', completed: true}
					];
					//resolve(data);
					setTimeout(function(){resolve(data);}, 2000);
				});
			},
            create: function(title) {
				return new Promise(function(resolve, reject) {
					var id = parseInt(Math.random()*100000);

					var todo = {id:id, title: title, completed: false};

					resolve(todo);
				});
			},
            changeTitle: function(id, value) {
				return new Promise(function(resolve, reject) {
					resolve(id, value);
				});
			},
            changeCompleteness: function(ids, value) {
				return new Promise(function(resolve, reject) {
					if (!(ids instanceof Array)) {
						ids = [ids]
					}

					resolve(ids, value);
				});
			},
            destroy: function destroy(ids) {
				return new Promise(function(resolve, reject) {
					if (!(ids instanceof Array)) {
						ids = [ids]
					}

					resolve(ids)
				});
			}
		};
	}
})(window, $, window.Promise, dust, Router);
