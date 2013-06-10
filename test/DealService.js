var assert = require("assert");
var DealService = require("../").DealService;

describe("DealService", function () {
	describe("when passed a request method", function () {
		var service = new DealService({
			request : function () {}
		});

		it("should have a request method", function () {
			assert.equal(typeof service.request, "function");
		});
		it("should have a stats method", function () {
			assert.equal(typeof service.stats, "function");
		});
	});
	describe("without passing a request method", function () {
		it("should throw", function () {
			assert.throws(function () {
				new DealService();
			});
		});
	});
});
