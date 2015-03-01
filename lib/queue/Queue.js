'use strict';

var eventemitter2 = require('eventemitter2');
var sander = require('sander');

var Queue = function Queue() {
	var queue = this;

	eventemitter2.EventEmitter2.call(this, {
		wildcard: true
	});

	queue._tasks = [];

	queue._run = function () {
		var task = queue._tasks.shift();

		if (!task) {
			queue._running = false;
			return;
		}

		task.promise.then(runOnNextTick, runOnNextTick);

		try {
			task.fn(task.fulfil, task.reject);
		} catch (err) {
			task.reject(err);

			queue.emit("error", err);
			runOnNextTick();
		}
	};

	function runOnNextTick() {
		process.nextTick(queue._run);
	}
};

Queue.prototype = Object.create(require("eventemitter2").EventEmitter2.prototype);
Queue.prototype.add = function (fn) {
	var task, promise;

	promise = new sander.Promise(function (fulfil, reject) {
		task = {
			fn: fn,
			fulfil: fulfil,
			reject: reject
		};
	});

	task.promise = promise;
	this._tasks.push(task);

	if (!this._running) {
		this._running = true;
		this._run();
	}

	return promise;
};

Queue.prototype.abort = function () {
	this._tasks = [];
	this._running = false;
};

exports['default'] = Queue;