registerPlugin({ // jshint ignore:line
	name: 'Twitch/Hitbox Status!',
	version: '1.2',
	description: 'Check periodicly your favorit streamers status!',
	author: 'Julian Huebenthal (Xuxe) <julian@julian-huebenthal.de>',
	vars: {
		type: {
			title: 'Streaming site:',
			type: 'select',
			options: [
				"twitch",
				"hitbox",
			]
		},
		name: {
			title: 'Streamer Name:',
			type: 'string',
		},
		cid: {
			title: 'Channel for Status Update:',
			type: 'channel',
		},
		interval: {
			title: 'Check interval in minutes. (Set it not to low you may get banned by the API Provider!)',
			type: 'number',
			value: 10,
		},
		offline_txt: {
			title: 'Offline Text: (%n - Streamer Name)',
			type: 'string',
			placeholder: '%n is offline.',
			value: '%n is offline.',
		},
		online_txt: {
			title: 'Online Text: (%n - Streamer Name | %g - Game)',
			type: 'string',
			placeholder: '%n (%g) is online!',
			value: '%n is online!',
		},

	}
}, function(sinusbot, config, pluginInfo) {
	var LastResponse;
	var cname;

	if (typeof config.cid === undefined) {
		sinusbot.log("No channel set.");
		return;
	}

	if (typeof config.interval === undefined || config.interval < 1) {
		sinusbot.log("Interval is to low or not defined.");
		return;
	}

	if (typeof config.name === undefined || config.name === "") {
		sinusbot.log("No Streamer name set.");
		return;
	}
	if (typeof config.offline_txt === undefined || config.offline_txt === "") {
		sinusbot.log("Offline Txt field is empty.");
		return;
	}
	if (typeof config.online_txt === undefined || config.online_txt === "") {
		sinusbot.log("Online Txt field is empty.");
		return;
	}


	sinusbot.on('api:ths_lastresponse', function(ev) {
		return LastResponse;
	});

	switch (config.type) {

		case 0:

			http_opts = {
				"method": "GET",
				"url": "https://api.twitch.tv/kraken/streams/" + config.name,
				"timeout": 60000,
				"headers": [{
					"Content-Type": "application/json"
				}, {
					"Accept": "application/vnd.twitchtv.v3+json"
				}]
			};

			function ProcessTwitchResponse(error, response) {
				LastResponse = response;
				if (response.statusCode != 200) {
					sinusbot.log(error);
					return;
				}
				UseUpdatesTwitch(JSON.parse(response.data));
			}

			function UseUpdatesTwitch(data) {
				if (data.stream === null) {
					cname = config.offline_txt.replace('%n', config.name);
					channelUpdate(config.cid, {
						"name": cname,
						"description": ""
					});
				} else {
					cname = config.online_txt.replace('%n', config.name).replace('%g', data.stream.game);
					channelUpdate(config.cid, {
						"name": cname,
						"description": ""
					});
				}
			}


			function RunTwitch() {
				sinusbot.http(http_opts, ProcessTwitchResponse);
				sinusbot.log("[T] Run() triggered \n");
			}

			setInterval(RunTwitch, 60000 * config.interval);

			sinusbot.on('api:twitch', function(ev) {
				sinusbot.http(http_opts, ProcessTwitchResponse);
				return 'Called.';
			});
			RunTwitch();

			break;

		case 1:

			http_opts = {
				"method": "GET",
				"url": "https://api.hitbox.tv/user/" + config.name,
				"timeout": 60000,
				"headers": [{
					"Content-Type": "application/json"
				}]
			};

			function ProcessHitBoxResponse(error, response) {
				LastResponse = response;
				if (response.statusCode != 200) {
					sinusbot.log(error);
					return;
				}
				UseUpdatesHitBox(JSON.parse(response.data));

			}

			function UseUpdatesHitBox(data) {
				if (data.is_live === 0) {
					cname = config.online_txt.replace('%n', config.name);
					channelUpdate(config.cid, {
						"name": cname,
						"description": ""
					});
				} else {
					cname = config.online_txt.replace('%n', config.name);
					channelUpdate(config.cid, {
						"name": cname,
						"description": ""
					});
				}
			}


			function RunHitbox() {
				sinusbot.http(http_opts, ProcessHitBoxResponse);
				sinusbot.log("[H] Run() triggered \n");
			}

			setInterval(RunHitbox, 60000 * config.interval);

			sinusbot.on('api:hitbox', function(ev) {
				sinusbot.http(http_opts, ProcessHitBoxResponse);
				return 'Called.';
			});
			RunHitbox();

			break;

	}
});