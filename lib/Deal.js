exports.DealService = DealService;

function DealService(opts) {
	var queue = {};
	var cache = {}, cacheCheckId;
	var stats = {};

	opts = opts || {};

	if (typeof opts.request != "function") {
		throw new Error("Missing 'request' method definition");
	}

	stats.requests = 0;
	stats.cached   = 0;
	stats.pending  = 0;

	return {
		stats: function () {
			return stats;
		},
		request: function (key, cb) {
			stats.requests += 1;

			if (cache.hasOwnProperty(key)) {
				stats.cached += 1;

				return cb.apply(null, cache[key].args);
			}

			stats.pending += 1;

			if (queue.hasOwnProperty(key)) {
				queue[key].push(cb);
			} else {
				queue[key] = [ cb ];

				opts.request(key, function () {
					if (!queue.hasOwnProperty(key)) return;

					for (var i = 0; i < queue[key].length; i++) {
						queue[key][i].apply(null, arguments);
					}

					stats.pending -= queue[key].length;

					if (opts.cache > 0) {
						cache[key] = {
							timeout : Date.now() + opts.cache,
							args    : arguments
						};

						analyzeCache(cacheCheckId, cache);
					}

					delete queue[key];
				});
			}

			return this;
		}
	};
}

function analyzeCache(cacheCheckId, cache) {
	if (cacheCheckId) {
		clearTimeout(cacheCheckId);
	}

	var next = null, key;

	for (var k in cache) {
		if (next === null || next > cache[k].timeout) {
			next = cache[k].timeout;
			key = k;
		}
	}

	if (next === null) return;

	cacheCheckId = setTimeout(function () {
		if (cache[k]) {
			delete cache[key];
		}
		analyzeCache(cacheCheckId, cache);
	}, next - Date.now());
}
