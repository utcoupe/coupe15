module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.action');

	function Action(owner, object_type, start_point, priority, duration, orders, type, name) {
		this.object_type;
		this.start_point; // x, y, a
		this.priority;
		this.duration;
		this.orders;
	}

	Action.prototype.do = function () {
		if (this.orders.lenght == 1)
			this.ia.client.send(this.owner, this.orders[0].name, this.orders[0].params);
		else {
			this.ia.client.send(this.owner, "orders_array", {orders: this.orders});
		}
	};
	
	return Action;
})();