$(function () {
	SC.initialize({
		client_id: '3a0223a4404c4efe6133f785bc3cea54',
		redirect_url: 'http://127.0.0.1'
	});
	var widget = SC.Widget($('#soundcloudWidget')[0]),
		playlist = [],
		allTracks = [],
		playlistEl = $('#playlist'),
		pages = $('#pages'),
		results = $('#searchResults'),
		$document = $(document),
		emptyQueue = $('#emptyQueue'),
		queue = $('#queue'),
		refreshPlaylistEl = function () {
			var length = playlist.length;
			playlistEl.html('');
			
			if (length > 0) {
				emptyQueue.slideUp();
				queue.slideDown();
				for (var i = 0; i < playlist.length; i++) {
					var uri = playlist[i];
					playlistEl.append(
						$('<li>').append(
							$('<span>').html(allTracks[uri].title)
						).append(
							$('<a class="removeFromPlaylist ui-state-default ui-corner-all" href="#" title="Remove from playlist"><span class="ui-icon ui-icon-circle-close"></span></a>')
								.data({
									uri: uri,
									itemId: i
								}))
					);
				}
			} else {
				emptyQueue.slideDown();
				queue.slideUp();
			}
		}, 
        
        //play next song
		playNext = function () {
			var next = playlist[0];
			if (next) {
				playlist = playlist.slice(1);
				widget.load(next, {
					callback: function () {
						refreshPlaylistEl();
						widget.play();
					}
				});
			}
		};

	widget.bind(SC.Widget.Events.FINISH, playNext);

	pages.tabs();
	$('#searchForm').submit(function (e) {
		SC.get("/tracks", {
			limit: 15,
			q: $('#query').val()
		}, function(tracks){
			results.html('');
			
			var template = '<li><span>%title%</span><a class="addToPlaylist ui-state-default ui-corner-all" href="#" data-uri="%uri%" title="Add to playlist"><span class="ui-icon ui-icon-circle-plus"></span></a></li>';


			for (var i = 0; i < tracks.length; i++) {
				var newTemplate = template;
				
				newTemplate = newTemplate.replace(/%(\w+)%/g, function (match) {
					return tracks[i][match.slice(1,-1)];
				});
				results.append($(newTemplate));
				allTracks[tracks[i]['uri']] = tracks[i];
			}
			pages.tabs({
				active: 2
			});
		});
		e.preventDefault();
	});
	
    //add song to playlist
	$document.on('click', '.addToPlaylist', function (e) {
		playlist.push($(this).data('uri'));
		refreshPlaylistEl();
		e.preventDefault();
	});
    
    //remove song from playlist
	$document.on('click', '#playlist .removeFromPlaylist', function (e) {
		var $this = $(this);
		$this.closest('li').slideUp(400, function () {
			var itemId = $this.data('itemId');
			playlist = playlist.slice(0, itemId).concat(playlist.slice(itemId + 1));
			refreshPlaylistEl();
		});
		e.preventDefault();
	});
	$document.on('mouseover mouseout', '#playlist li, #searchResults li', function (e) {
		$(this).toggleClass('ui-state-hover');
	});
	$('#next').click(function (e) {
		playNext();
		e.preventDefault();
	});
});