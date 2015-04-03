(function () {
	// Requires

	var queue = [];

	// On message
	client.order(function (from, name, params){
		// if flush the queue
		if(name == "queue_flush"){
			queue = [];
			return;
		}

		// if end of match, empty the queue and stop the current action
		if(name == "stop"){
			queue = [];
			// XXX comment stopper un action en cours ???
			return;
		}

		addOrder2Queue(from, name, params);
	});

	// Unshift the order (enfiler)
	function addOrder2Queue(f, n, p){
		l = queue.length;

		// Adds the order to the queue
		queue.unshift({
			from: f,
			name: n,
			params: params
		});

		if (l === 0) executeNextOrder();
	}

	// Execute order
	function executeNextOrder(){
		order = queue.shift();

		orderHandler(order.from, order.name, order.params);

		if (l === 0) executeNextOrder();
	}
})();