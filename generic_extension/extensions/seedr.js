(() => {
  function main() {
    const original = $.getScript;
    $.getScript = (url, callback) => {
      if (url === "https://static.seedr.cc/dev/js/seedr_video.js")
        return callback();
      return original(url, callback);
    };
    override_seedr_video();
  }
  main();

  function override_seedr_video() {
    var SeedrChromecast = function (params) {
      if (typeof chrome === "undefined") {
        // chromecast not supported
        return;
      }

      this.CAST_API_INITIALIZATION_DELAY = 2000;
      this.PROGRESS_BAR_UPDATE_DELAY = 1000;
      this.SESSION_IDLE_TIMEOUT = 300000;
      //this.APP_ID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;//'08B9C5B4';

      this.currentMediaSession = null;
      this.currentVolume = 0.5;
      this.progressFlag = 1;
      this.mediaCurrentTime = 0;
      this.session = null;

      this.currentMediaURL = "";
      this.currentMediaTitle = "";
      this.currentMediaThumb = "";

      this.currentTime = 0;

      this.timer = null;

      this.loading_media = false;

      this.connected_callback =
        typeof params.connected_callback !== "undefined"
          ? params.connected_callback
          : function () {};
      this.disconnected_callback =
        typeof params.disconnected_callback !== "undefined"
          ? params.disconnected_callback
          : function () {};
      this.media_status_callback =
        typeof params.media_status_callback !== "undefined"
          ? params.media_status_callback
          : function () {};
      this.time_callback =
        typeof params.time_callback !== "undefined"
          ? params.time_callback
          : function () {};
      this.loaded_callback =
        typeof params.loaded_callback !== "undefined"
          ? params.loaded_callback
          : function () {};

      this.cast_loaded = false;

      var sc = this;

      this.initializeCastApi = function () {
        // request session
        if (!chrome.cast) {
          return;
        }
        var sessionRequest = new chrome.cast.SessionRequest(
          chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
        );
        var apiConfig = new chrome.cast.ApiConfig(
          sessionRequest,
          sc.sessionListener,
          sc.receiverListener,
          chrome.cast.AutoJoinPolicy.PAGE_SCOPED
        );

        chrome.cast.initialize(apiConfig, sc.onInitSuccess, sc.onError);
      };

      this.onInitSuccess = function () {
        sc.appendMessage("init success");
        sc.cast_loaded = true;
        sc.loaded_callback();
      };

      this.onError = function (e) {
        sc.appendMessage(e);
      };

      this.onSuccess = function (message) {
        sc.appendMessage(message);
      };

      this.onStopAppSuccess = function () {
        sc.appendMessage("Session stopped");
      };

      this.sessionListener = function (e) {
        sc.appendMessage("New session ID:" + e.sessionId);
        sc.session = e;

        sc.connected_callback("CHROMECAST");

        if (sc.session.media.length != 0) {
          sc.appendMessage(
            "Found " + sc.session.media.length + " existing media sessions."
          );
          sc.onMediaDiscovered("sessionListener", sc.session.media[0]);
        }
      };

      this.sessionUpdateListener = function (isAlive) {
        if (!isAlive) {
          sc.session = null;
          sc.disconnected_callback();
          if (sc.timer) {
            clearInterval(sc.timer);
          } else {
            timer = setInterval(
              sc.updateCurrentTime.bind(sc),
              sc.PROGRESS_BAR_UPDATE_DELAY
            );
          }
        }
      };

      this.receiverListener = function (e) {
        if (e === "available") {
          sc.appendMessage("receiver found");
        } else {
          sc.appendMessage("receiver list empty");
        }
      };

      this.loadMedia = function (
        url,
        title,
        thumb,
        subtitles,
        active_subtitle
      ) {
        sc.currentMediaURL = url;
        sc.currentMediaTitle = title;
        sc.currentMediaThumb = thumb;

        if (!sc.session) {
          sc.appendMessage("no session");
          return;
        }

        var mediaInfo;
        if (url) {
          mediaInfo = new chrome.cast.media.MediaInfo(url);
          sc.currentMediaTitle = title;
          sc.currentMediaThumb = thumb;
        } else {
          sc.appendMessage("loading... " + sc.currentMediaURL);
          mediaInfo = new chrome.cast.media.MediaInfo(sc.currentMediaURL);
        }
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.metadataType =
          chrome.cast.media.MetadataType.GENERIC;
        mediaInfo.contentType = "application/x-mpegURL";
        // mediaInfo.contentType = 'video/mp4';

        var has_subtitles = false;
        if (!!subtitles) {
          var i = 0;
          for (title in subtitles) {
            has_subtitles = true;
            var subtitles_track = new chrome.cast.media.Track(
              i,
              chrome.cast.media.TrackType.TEXT
            );
            subtitles_track.trackContentId = subtitles[title];
            subtitles_track.trackContentType = "text/vtt";
            subtitles_track.subtype = "SUBTITLES";
            subtitles_track.name = title;
            subtitles_track.language = "en-US";

            if (!mediaInfo.tracks) {
              mediaInfo.tracks = [];
            }

            mediaInfo.tracks.push(subtitles_track);
            mediaInfo.streamType = "LIVE";
            mediaInfo.textTrackStyle = {
              edgeColor: "#CECECE", // see http://dev.w3.org/csswg/css-color/#hex-notation
              fontScale: 1.24, // transforms into "font-size: " + (fontScale*100) +"%"
            };
            i++;
          }
        }

        mediaInfo.metadata.title = sc.currentMediaTitle;
        //mediaInfo.metadata.images = [{'url': MEDIA_SOURCE_ROOT + sc.currentMediaThumb}];

        var request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.autoplay = true;
        request.currentTime = 0;
        if (!!subtitles) {
          if (has_subtitles) {
            request.activeTrackIds = [active_subtitle];
          }
        }

        sc.loading_media = true;
        sc.session.loadMedia(
          request,
          sc.onMediaDiscovered.bind(this, "loadMedia"),
          sc.onMediaError
        );
      };

      this.loadSubtitles = function (subtitles, active_subtitle) {
        var time = sc.currentTime;
        sc.loadMedia(
          sc.currentMediaURL,
          sc.currentMediaTitle,
          sc.CurrentMediaThumb,
          subtitles,
          active_subtitle
        );
        sc.seek(time);
      };

      this.setActiveSubtitles = function (id) {
        var activeTrackIds = id == -1 ? [] : [id];
        var tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(
          activeTrackIds
        );
        sc.currentMediaSession.editTracksInfo(
          tracksInfoRequest,
          function () {},
          function () {}
        );
      };

      this.launchApp = function () {
        sc.appendMessage("launching app...");

        if (!sc.session) {
          chrome.cast.requestSession(
            sc.onRequestSessionSuccess,
            sc.onLaunchError
          );
          if (sc.timer) {
            clearInterval(sc.timer);
          }
        } else {
          sc.connected_callback("CHROMECAST");
        }
      };

      this.onRequestSessionSuccess = function (e) {
        sc.appendMessage("session success: " + e.sessionId);

        sc.session = e;
        sc.session.addUpdateListener(sc.sessionUpdateListener.bind(sc));

        sc.session.addMediaListener(
          sc.onMediaDiscovered.bind(sc, "addMediaListener")
        );

        sc.connected_callback("CHROMECAST");
      };

      this.onLaunchError = function () {
        sc.appendMessage("launch error");
        sc.disconnected_callback();
      };

      this.saveSessionID = function (sessionId) {
        // Check browser support of localStorage
        if (typeof Storage != "undefined") {
          // Store sessionId and timestamp into an object
          var object = { id: sessionId, timestamp: new Date().getTime() };
          //localStorage.setItem('storedSession', JSON.stringify(object));
        }
      };

      this.joinSessionBySessionId = function (session_id) {
        chrome.cast.requestSessionById(session_id);
      };

      this.stopApp = function () {
        sc.session.stop(sc.onStopAppSuccess, sc.onError);
        if (sc.timer) {
          clearInterval(sc.timer);
        }
      };

      this.onMediaDiscovered = function (how, mediaSession) {
        if (sc.loading_media) {
          sc.loading_media = false;
          sc.appendMessage(
            "new media session ID:" +
              mediaSession.mediaSessionId +
              " (" +
              how +
              ")"
          );
          sc.currentMediaSession = mediaSession;
          sc.currentMediaSession.addUpdateListener(sc.onMediaStatusUpdate);
          sc.mediaCurrentTime = sc.currentMediaSession.currentTime;

          if (!sc.timer) {
            sc.timer = setInterval(
              sc.updateCurrentTime.bind(sc),
              sc.PROGRESS_BAR_UPDATE_DELAY
            );
          }
        } else {
          sc.session = null;
          sc.disconnected_callback();
        }
      };

      this.stopApp = function () {
        sc.session.stop(onStopAppSuccess, onError);
        if (sc.timer) {
          clearInterval(sc.timer);
        }
      };

      function onStopAppSuccess() {
        sc.disconnected_callback();
        sc.appendMessage("Session stopped");
      }

      this.onMediaError = function (e) {
        sc.appendMessage("media error");
      };

      this.getMediaStatus = function () {
        if (!sc.session || !sc.currentMediaSession) {
          return;
        }

        sc.currentMediaSession.getStatus(
          null,
          sc.mediaCommandSuccessCallback.bind(sc, "got media status"),
          sc.onError
        );
      };

      this.onMediaStatusUpdate = function (isAlive) {
        if (isAlive) {
          var cms = sc.currentMediaSession;
          sc.currentTime = cms.currentTime;
          sc.media_status_callback(
            cms.playerState,
            cms.currentTime,
            cms.media.duration
          );
        }
      };

      this.updateCurrentTime = function () {
        if (!sc.session || !sc.currentMediaSession) {
          return;
        }

        if (sc.currentMediaSession.media) {
          var cTime = sc.currentMediaSession.getEstimatedTime();
          sc.time_callback(cTime);
        } else {
          if (sc.timer) {
            clearInterval(sc.timer);
          }
        }
      };

      this.play = function () {
        if (!sc.currentMediaSession) {
          return;
        }

        if (sc.timer) {
          clearInterval(sc.timer);
        }

        sc.currentMediaSession.play(
          null,
          sc.mediaCommandSuccessCallback.bind(
            sc,
            "playing started for " + sc.currentMediaSession.sessionId
          ),
          sc.onError
        );

        sc.appendMessage("play started");
        sc.timer = setInterval(
          sc.updateCurrentTime.bind(sc),
          sc.PROGRESS_BAR_UPDATE_DELAY
        );
      };

      this.pause = function () {
        if (!sc.currentMediaSession) {
          return;
        }

        if (sc.timer) {
          clearInterval(sc.timer);
        }

        sc.currentMediaSession.pause(
          null,
          sc.mediaCommandSuccessCallback.bind(
            sc,
            "paused " + sc.currentMediaSession.sessionId
          ),
          sc.onError
        );

        sc.appendMessage("paused");
      };

      this.stop = function () {
        if (!sc.currentMediaSession) return;

        sc.currentMediaSession.stop(
          null,
          sc.mediaCommandSuccessCallback.bind(
            sc,
            "stopped " + sc.currentMediaSession.sessionId
          ),
          sc.onError
        );

        sc.appendMessage("media stopped");
        if (sc.timer) {
          clearInterval(sc.timer);
        }
      };

      this.setVolume = function (level, mute) {
        if (!sc.session) return;

        if (!mute) {
          sc.session.setReceiverVolumeLevel(
            level,
            sc.mediaCommandSuccessCallback.bind(sc, "media set-volume done"),
            sc.onError
          );
          sc.currentVolume = level;
        } else {
          sc.session.setReceiverMuted(
            true,
            sc.mediaCommandSuccessCallback.bind(sc, "media set-volume done"),
            sc.onError
          );
        }
      };

      this.mute = function (mute) {
        if (!sc.session || !sc.currentMediaSession) {
          return;
        }

        if (mute) {
          sc.session.setReceiverVolume(sc.currentVolume, true);
          sc.appendMessage("media muted");
        } else {
          sc.session.setReceiverVolume(sc.currentVolume, false);
          sc.appendMessage("media unmuted");
        }
      };

      this.seek = function (pos) {
        if (sc.currentMediaSession) {
          if (sc.currentMediaSession.sessionId) {
            sc.appendMessage(
              "Seeking " +
                sc.currentMediaSession.sessionId +
                ":" +
                sc.currentMediaSession.mediaSessionId +
                " to " +
                pos
            );
            sc.progressFlag = 0;
            var request = new chrome.cast.media.SeekRequest();
            request.currentTime = pos;
            sc.currentMediaSession.seek(
              request,
              sc.onSeekSuccess.bind(sc, "media seek done"),
              sc.onError
            );
          }
        }
      };

      this.onSeekSuccess = function (info) {
        sc.appendMessage(info);
        setTimeout(function () {
          sc.progressFlag = 1;
        }, sc.PROGRESS_BAR_UPDATE_DELAY);
      };

      this.mediaCommandSuccessCallback = function (info) {
        sc.appendMessage(info);
      };

      this.appendMessage = function (message) {
        console.log("SeedrChromecast: " + JSON.stringify(message));
      };

      // Load cast_sender

      if (
        !$(
          'script[src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"]'
        ).length
      ) {
        window["__onGCastApiAvailable"] = function (loaded, errorInfo) {
          if (loaded) {
            sc.initializeCastApi();
          } else {
            console.log(errorInfo);
          }
        };

        $("head").append(
          "<script src='https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'></script>"
        );
      }
    };

    var seedr_chromecast = false;

    var SeedrVideo = function (params) {
      this.player = null;
      var elem_id = (this.elem_id = params.elem_id);

      this.width = params.width;
      this.height = params.height;

      this.is_paid = account.premium == true;
      this.is_chromeless = false;

      this.current_media = params.src_hls;
      this.current_media_hls = params.src_hls;
      this.current_media_mp4 = params.src_mp4;

      this.subtitles = params.subtitles;
      this.os_subtitles = [];

      this.current_title = params.title;
      this.video_seek_to = params.seek_to;

      SeedrVideo.instances[params.elem_id] = this;

      this.post_init = false;

      this.casting = false;

      this.is_dvr = params.is_dvr;

      this.hls = false;

      this.force_html5 =
        typeof params.force_html5 === "undefined" ? false : params.force_html5;
      this.cc_control =
        typeof params.cc_control === "undefined" ? true : params.cc_control;

      this.folder_file_id =
        typeof params.folder_file_id === "undefined"
          ? 0
          : params.folder_file_id;

      var sv = this;

      this.buffering_timer = false;

      if (params.video_load_failed_callback) {
        this.video_load_failed_callback = params.video_load_failed_callback;
      } else {
        this.video_load_failed_callback = function (error) {};
      }

      this.unload = function () {
        $(sv.player).replaceWith($('<div id="player"></div>'));

        if (sv.buffering_timer) {
          window.clearInterval(sv.buffering_timer);
        }

        delete SeedrVideo.instances["player"];
      };

      this.pause = function () {
        sv.player.pause();
        $(".sv-playpause", $("#" + elem_id)).removeClass("playing");
      };

      this.stop = function () {
        if (this.is_html()) {
          if (typeof sv.hls.destroy === "function") {
            sv.hls.destroy();
          }
          $(sv.player).remove();
        }
      };
      this.play = function () {
        $(".sv-playpause", $("#" + elem_id)).addClass("playing");
        sv.player.play();
        $(".sv-play-div", $("#" + elem_id)).hide();

        $(".sv-play-div", $("#" + elem_id)).hide();
      };

      this.getFlashSubtitlesJSON = function (subtitles) {
        var subs = [];

        for (title in subtitles) {
          subs.push({ src: subtitles[title], label: title });
        }
        return JSON.stringify({
          subtitles: subs,
          config: {
            fontSize: 0.037,
            minFontSize: 20,
            maxFontSize: 55,
            textColor: 0xfdfdfd,
            bgColor: 0x101010,
            bgAlpha: 0.23,
          },
        });
      };

      this.loadOSSubtitles = function (url) {
        if (sv.is_html()) {
          var v = $(sv.player);
          var p = v.parent();
          // add OS track
          var tracks = $(sv.player).find("track");
          var last_track = tracks.last();
          if (last_track.is(".os")) {
            last_track.remove();
          }

          v.append(
            $(
              '<track class="os" src="' +
                url +
                '" kind="subtitles" srclang="en" label="OS Subtitles" />'
            )
          );

          var tracks = $(sv.player).find("track");

          // Show CC control if not shown
          v.parent().find(".sv-cc").show();
          v.parent().find(".sv-cc-sync").show();

          $(".sv-button-menu-subs", p).remove();
          var sub_menu = $("<ul />", {
            class: "sv-button-menu sv-button-menu-subs",
          });
          sub_menu.append(
            '<li class="sv-button-menu-subs-buttons"><button class="button tiny sv-menu-add-subs"><i class="fa fa-upload"></i> Add</button> | <button class="button tiny sv-menu-search-subs"><i class="fa fa-search"></i> Search</button></li>'
          );

          for (title in sv.subtitles) {
            sub_menu.append("<li>" + title + "</li>");
          }
          sub_menu.append('<li class="active os">OS Subtitles</li>');
          sub_menu.append(
            '<li class="sv-disable-subs">Hide Subs<i class="fa fa-times" style="margin-left: 10px;"></i></li>'
          );

          sv.os_subtitles["OS Subtitles"] = url;

          $(".sv-cc", p).append(sub_menu);

          var tracks = $(sv.player).find("track");
          setTimeout(function () {
            for (var i = 0; i < tracks.length; i++) {
              tracks[i].track.mode =
                i == tracks.length - 1 ? "showing" : "disabled";
            }
          }, 50);

          origStarts = [];
          origEnds = [];
          $(".sv-cc-sync", p).val(0);
          // or add to CC menu ( or replace ) if it exists
          if (sv.casting) {
            var s = [];
            s = $.extend(s, sv.subtitles);
            s = $.extend(s, sv.os_subtitles);
            seedr_chromecast.loadSubtitles(s, tracks.length - 1);
          }
        } else {
          sv.subtitles = { "OS Subs": url };
          sv.player.setResourceMetadata(
            "http://kutu.ru/osmf/plugins/subtitles",
            sv.getFlashSubtitlesJSON(sv.subtitles)
          );
          sv.video_seek_to = sv.player.getCurrentTime();
          sv.player.load();

          if (sv.casting) {
            seedr_chromecast.loadSubtitles(sv.subtitles, 0);
          }
        }
      };

      this.isAndroidNative = function () {
        var nua = navigator.userAgent;
        if (
          nua.indexOf("Mozilla/5.0") > -1 &&
          nua.indexOf("Android ") > -1 &&
          nua.indexOf("AppleWebKit") > -1
        ) {
          if (nua.indexOf("Chrome") > -1) {
            return false;
          }
          return true;
        } else {
          return false;
        }
      };

      this.isAndroid = function () {
        var nua = navigator.userAgent;
        return (
          nua.indexOf("Mozilla/5.0") > -1 &&
          nua.indexOf("Android ") > -1 &&
          nua.indexOf("AppleWebKit") > -1
        );
      };

      this.isSamsung = function () {
        var nua = navigator.userAgent;

        return nua.indexOf("SamsungBrowser") > -1;
      };

      this.is_html = function () {
        var has_flash =
          "undefined" !=
          typeof navigator.mimeTypes["application/x-shockwave-flash"];
        var hls_supported = Hls.isSupported();
        return hls_supported || !has_flash;
      };

      this.isSafari = function () {
        return (
          navigator.vendor &&
          navigator.vendor.indexOf("Apple") > -1 &&
          navigator.userAgent &&
          !navigator.userAgent.match("CriOS")
        );
      };

      this.isiOS = function () {
        return navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false;
      };

      this.isFirefox = function () {
        return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
      };

      this.isPS4 = function () {
        return navigator.userAgent.toLowerCase().indexOf("playstation") > -1;
      };

      this.can_dvr = function () {
        var is_ios = navigator.userAgent.match(/iPad|iPhone|iPod/g)
          ? true
          : false;
        var is_safari = /^((?!chrome).)*safari/i.test(navigator.userAgent);
        var is_hls = Hls.isSupported();
        var is_ps4 = navigator.userAgent.match(/PlayStation/g) ? true : false;
        var is_samsung = navigator.userAgent.match(/SamsungBrowser/i);
        return is_ios || is_safari || is_hls || is_ps4 || is_samsung;
      };

      this.showTime = function (p) {
        var d = sv.player.duration;
        d = d !== Infinity ? d : 0;
        var media_controls = $(".sv-control-area", "#" + sv.elem_id);
        var r = p / d;

        if (isNaN(d)) {
          return;
        }

        duration = dayjs.utc(d * 1000).format(d > 3600 ? "H:mm:ss" : "m:ss");
        time = dayjs.utc(p * 1000).format(p > 3600 ? "H:mm:ss" : "m:ss");

        var p_pct = r * 100 + "%";

        $(".sv-played", media_controls).css("width", p_pct);
        $(".sv-switch", media_controls).css("left", p_pct);

        $(".sv-time", media_controls).text(time);
        $(".sv-duration", media_controls).text(duration);

        var buffered = sv.player.buffered;

        for (var i = 0; i < buffered.length; i++) {
          if (buffered.start(i) <= p && buffered.end(i) >= p) {
            $(".sv-buffered", media_controls).css(
              "width",
              (buffered.end(i) / d) * 100 + "%"
            );
            break;
          }
        }
      };

      this.initPlayer = function () {
        if (sv.is_html() || sv.force_html5) {
          var hideControlsTimeout = false;
          var showControls = function (hideAfter) {
            clearTimeout(hideControlsTimeout);
            if (media_controls) {
              media_controls.addClass("shown");
            }
            p.css("cursor", "auto");

            if (sv.subtitles) {
              $(".sv-cc-sync", p).show();
            }
            hideControlsTimeout = setTimeout(function () {
              var sc = $(".sv-cc-sync", p);

              if ($("input", sc).is(":focus")) {
                showControls();
              } else if (is_fullscreen || device_type != "mobile") {
                if (media_controls) media_controls.removeClass("shown");
                p.css("cursor", "none");
                sc.hide();
              }
            }, 3000);
          };

          var changingCues = 0;

          var offset_queue = false;
          var offset_running = false;
          var origStarts = [];
          var origEnds = [];
          sv.offsetSubs = function (new_offset) {
            if (offset_running) {
              offset_queue = new_offset;
              return;
            }
            offset_queue = false;
            offset_running = true;

            var active = 0;
            if ($(".sv-button-menu-subs", media_controls).length != 0) {
              var selected = $(
                ".sv-button-menu-subs li.active",
                media_controls
              );
              if (selected.is(".sv-disable-subs")) {
                offset_running = false;
                return;
              }

              active = selected.index() - 1;
            }

            var cues = $("track", v)[active].track.cues;

            if (origStarts.length != cues.length) {
              origStarts = [];
              origEnds = [];

              for (i = 0; i < cues.length; i++) {
                origStarts.push(cues[i].startTime);
                origEnds.push(cues[i].endTime);
              }
            }
            for (i = 0; i < cues.length; i++) {
              if (i > 0) {
                if (origStarts[i] + new_offset <= cues[i - 1].endTime) {
                  cues[i].startTime = cues[i - 1].endTime + 0.001;
                  cues[i].endTime = cues[i - 1].endTime + 0.002;
                  continue;
                }
              } else {
                if (origStarts[0] + new_offset < 0) {
                  cues[0].startTime = 0.001;
                  cues[0].endtime = 0.002;
                  continue;
                }
              }
              cues[i].endTime = origEnds[i] + new_offset;
              cues[i].startTime = origStarts[i] + new_offset;
            }

            offset_running = false;
            if (offset_queue) sv.offsetSubs(offset_queue);
          };

          var is_android_native = sv.isAndroidNative();
          var is_ios = navigator.userAgent.match(/iPad|iPhone|iPod/g)
            ? true
            : false;
          var is_safari = /^((?!chrome).)*safari/i.test(navigator.userAgent);

          var fullscreen_video_container = $(
            'div.fullscreen-elem[sv_id="' + sv.elem_id + '"]'
          );
          if (!fullscreen_video_container.length) {
            fullscreen_video_container = $("<div />", {
              class: "fullscreen-elem",
              sv_id: sv.elem_id,
            });
            $("body").prepend(fullscreen_video_container);
          }

          var p = $("#" + sv.elem_id)
            .addClass("sv-html5-video-container")
            .attr("tabindex", 500);
          var parent = p.parent();
          p.empty()
            .css("width", sv.width + "px")
            .css("height", sv.height + "px");

          p.append(
            '<div class="player-finished"><i class="fa fa-repeat"></i></div>'
          );
          p.append(
            '<div class="sv-buffering-div"><img src="https://static.seedr.cc/images/player-loader.svg"></div>'
          );

          p.append(
            '<div class="sv-play-div"><img src="https://static.seedr.cc/images/player-play-2.png"></div>'
          );

          p.focus();

          var v = $("<video />", { class: "sv-html5-video", tabindex: 200 })
            .css("width", "100%")
            .css("height", "100%");

          sv.player = v[0];

          p.on("keydown", function (e) {
            switch (e.which) {
              // volume
              case 38: // up
                if (sv.casting) {
                  seedr_chromecast.setVolume(
                    seedr_chromecast.currentMediaSession.volume.level - 0.02
                  );
                }
                v[0].volume = Math.min(v[0].volume + 0.01, 1);

                v[0].muted = false;
                break;
              case 40: // down
                if (sv.casting) {
                  seedr_chromecast.setVolume(
                    seedr_chromecast.currentMediaSession.volume.level + 0.02
                  );
                }

                v[0].volume = Math.max(v[0].volume - 0.01, 0);
                break;

              // seek
              case 37: // left
                if (sv.casting) {
                  seedr_chromecast.seek(
                    seedr_chromecast.currentMediaSession.currentTime - 5
                  );
                } else {
                  v[0].currentTime = v[0].currentTime - 5;
                  sv.showTime(v[0].currentTime);
                  showControls();
                  setTimeout(sv.play, 10);
                }
                break;
              case 39: // right
                if (sv.casting) {
                  seedr_chromecast.seek(
                    seedr_chromecast.currentMediaSession.currentTime + 5
                  );
                } else {
                  v[0].currentTime = v[0].currentTime + 5;
                  sv.showTime(v[0].currentTime);
                  showControls();
                  setTimeout(sv.play, 10);
                }
                break;

              case 32: // space
                $(".sv-playpause", media_controls).click();
                showControls();
                break;

              default:
                if (!sv.casting) {
                  var c = String.fromCharCode(e.which);
                  if (c == "f" || c == "F") {
                    $(".sv-fullscreen", media_controls).click();
                  }
                  showControls();
                }
            }
          });

          if (
            Hls.isSupported() /* && !sv.isSafari()*/ &&
            !sv.isPS4() &&
            !sv.isiOS() &&
            sv.current_media_hls &&
            !sv.isSamsung()
          ) {
            var video = v[0];

            var swap_attempted = false;
            var recover_attempted = false;
            video.addEventListener("error", function (event) {}, true);

            sv.hls = new Hls({
              defaultAudioCodec: "mp4a.40.2",
              liveSyncDurationCount: 1000000,
              maxBufferLength: 120,
              maxMaxBufferLength: 320,
            });

            sv.hls.on(Hls.Events.ERROR, function (event, data) {
              console.log(event);
              console.log(data);

              if (data.fatal) {
                if (!recover_attempted) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      if (data.details === "levelEmptyError") {
                        console.log("No segments found, attempting to retry");
                        setTimeout(() => {
                          sv.hls.startLoad();
                        }, 5000); // 5000 milliseconds delay
                        break;
                      }

                      // try to recover network error
                      console.log(
                        "fatal network error encountered, try to recover"
                      );
                      recover_attempted = true;

                      setTimeout(() => {
                        sv.hls.startLoad();
                      }, 3000); // 5000 milliseconds delay

                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.log(
                        "fatal media error encountered, try to recover"
                      );
                      recover_attempted = true;
                      sv.hls.recoverMediaError();
                      break;
                    default:
                      // cannot recover
                      sv.hls.destroy();
                      break;
                  }
                } else if (!swap_attempted) {
                  sv.hls.swapAudioCodec();
                } else {
                  sv.hls.destroy();
                }
              } else {
                if (data.details != "bufferStalledError") {
                  sv.hls.recoverMediaError();
                  setTimeout(sv.play, 30);
                }
              }
            });

            sv.hls.loadSource(sv.current_media_hls);
            sv.hls.attachMedia(video);
            sv.hls.on(Hls.Events.MANIFEST_PARSED, function () {
              if (!sv.casting && device_type != "mobile") sv.play();

              // If HD show quality menu

              var video_quality = getCookie("video_quality");
              video_quality = video_quality == "" ? "auto" : video_quality;

              if (sv.hls.levels.length > 1 || !sv.is_paid) {
                var quality_menu = $(
                  '<ul class="sv-button-menu"><li q="hd" class="hd">HD ' +
                    (!sv.is_paid
                      ? ' <i>premium</i> <i class="fa fa-star"></i>'
                      : "") +
                    '</li><li q="sd" class="sd">SD 320p</li> <li q="auto" class="auto">Automatic</li></ul>'
                );
                $(".sv-quality", media_controls).append(quality_menu).show();

                // Set menu to default quality
                $("." + video_quality, quality_menu).toggleClass(
                  "active",
                  true
                );
                // Function for handling quality change (automatic+manual)
                $("li", quality_menu).on("click", function (e) {
                  if ($(this).is(".hd") && !sv.is_paid) return;

                  $(this).closest("ul").find("li").toggleClass("active", false);
                  $(this).toggleClass("active", true);
                  video_quality = $(this).attr("q");
                  setCookie("video_quality", video_quality);

                  if (video_quality == "auto") {
                    sv.hls.autoLevelEnabled = true;
                  } else {
                    sv.hls.autoLevelEnabled = false;
                    sv.hls.currentLevel = $(this).is(".hd") ? 1 : 0;
                  }
                });
                $(".sv-quality").on("click", function () {
                  quality_menu.toggle();
                });
              }
            });

            sv.hls.on(Hls.Events.LEVEL_SWITCHED, function () {
              if (sv.hls.levels.length > 1) {
                $(".sv-quality", media_controls).toggleClass(
                  "hd",
                  sv.hls.currentLevel == 1
                );
              }
            });

            $("#player")[0].addEventListener("error", function (e) {
              sv.video_load_failed_callback(e.target.src);
            });
          } else {
            var source;
            source = $("<source />", {
              src: sv.current_media_mp4
                ? sv.current_media_mp4
                : sv.current_media_hls,
            });

            var first_play = true;

            v.append(source);
            source[0].addEventListener("error", function (e) {
              sv.video_load_failed_callback(e.target.src);
            });

            source[0].addEventListener("playing", function (e) {
              first_play = false;
              if (first_play) {
                v[0].currentTime = sv.video_seek_to;
              }
            });
          }
          p.append(
            '<div class="sv-subs-upload-container">\
    <form style="position:relative">\
    <div class="seedr-loader-container"><div class="seedr-loader"></div></div>\
    <a class="sv-subs-upload-close">x</a> \
      <h5>Add Subtitles</h5>\
      <h4>1. Upload Subtitles</h4>\
  <div>\
  <input type="file" name="sub_file" value="Upload Subtitles" accept=".srt,.vtt,.ssa,.ass">\
  </div>\
      <h4>2. Select Language</h4>\
      <select name="lang">\
                    <option value="eng">English</option>\
                    <option value="spa">Español</option>\
                    <option value="ger">Deutsch</option>\
                    <option value="fre">Français</option>\
                    <option value="por">Português</option>\
                    <option value="pob">Português(BR)</option>\
                    <option value="jpn">日本語</option>\
                    <option value="ita">Italiano</option>\
                    <option value="dut">Nederlands</option>\
                    <option value="pol">polski</option>\
                    <option value="rus">Pусский</option>\
                    <option value="fin">suomi</option>\
                    <option value="nor">Norwegian</option>\
                    <option value="swe">Svenska</option>\
                    <option value="dan">Dansk</option>\
            <option value="cze">český</option>\
                    <option value="tur">Türkçe</option>\
                    <option value="ell">Ελληνικά</option>\
                    <option value="hun">magyar</option>\
                    <option value="ara">العربية</option>\
                    <option value="heb">עברית</option>\
                    <option value="rum">română</option>\
                    <option value="bul">български</option>\
                    <option value="ind">Bahasa Indonesia</option>\
            <option value="chi">Chinese (Simplified)</option>\
                  </select><p><input type="hidden" name="id" value="' +
              sv.folder_file_id +
              '"></input></p>\
    <div><button style="display: block;width: 100%;" class="success">Add Subtitles</button></div></form>\
    </div>'
          );

          $(".sv-subs-upload-close", p).on("click", function (e) {
            e.preventDefault();
            $(this).parents(".sv-subs-upload-container").removeClass("shown");
          });

          $("form", ".sv-subs-upload-container").on("submit", function (e) {
            var container = $(this).closest(".sv-subs-upload-container");
            var subs_list = $(sv.player).parent().find(".sv-button-menu-subs");
            var loader = container.find(".seedr-loader-container");
            var formData = new FormData($(this)[0]);

            loader.addClass("shown");

            apiClient
              .post("/subtitles/file/" + sv.folder_file_id, {
                params: formData,
              })
              .then(function (response) {
                var res = response.data;

                loader.removeClass("shown");
                container.removeClass("shown");

                var url = res.url;
                var title = res.title;

                // add before last .os or last .sv-disable-subs

                var sub_elem = $('<li class="active">' + title + "</li>");
                subs_list.find(".os,.sv-disable-subs").first().before(sub_elem);

                var tracks = $(sv.player).find("track");
                var track = $(
                  '<track src="' +
                    url +
                    '" kind="subtitles" srclang="en" label="' +
                    title +
                    '" />'
                );

                var os_track = tracks.find(".os");
                if (os_track.length) {
                  os_track.before(track);
                } else {
                  $(sv.player).append(track);
                }

                var idx = sub_elem.index() - 1;
                for (var i = 0; i < tracks.length; i++) {
                  $("track", sv.player)[i].track.mode =
                    idx == i ? "showing" : "disabled";
                }

                if (sv.casting) {
                  var s = [];
                  s = $.extend(s, sv.subtitles);
                  s = $.extend(s, sv.os_subtitles);
                  seedr_chromecast.loadSubtitles(
                    s,
                    $("track", sv.player).length - 1
                  );
                }
              })
              .catch(function (response) {
                loader.removeClass("shown");
              });

            e.preventDefault();
            return false;
          });
          p.append(v);

          p.append(
            $(
              [
                '<div class="sv-chromecast-overlay">',
                '	<div class="sv-chromecast-inner">',
                "  		<div>",
                '			<img src="https://static.seedr.cc/images/chromecast_stick.png">',
                '    		<div class="sv-chromecast-state">Connecting ...</div>',
                "  		</div>",
                "   </div>",
                "</div>",
              ].join("\n")
            )
          );

          if (sv.isiOS()) {
            $(".sv-play-div", p)
              .css("pointer-events", "auto")
              .click(function () {
                v.attr("controls", "controls");
                sv.play();
              });
          }

          var subtitles_search_button = false;
          if (sv.cc_control) {
            subtitles_search_button = $(
              '<div style="" class="sv-subtitles-search" onclick="javascript:$(\'#video-modal-closed-captions\').click();"><img src="https://static.seedr.cc/images/subtitles_search.png" /></div>'
            );
            p.append(subtitles_search_button);
            p.append(
              $(
                '<div class="sv-cc-sync">sync (sec) <input type="number" min="-180" max="180" step="0.1" value="0"></div>'
              )
            );
            $("input[type=number]", p).inputNumber();
          }

          var is_fullscreen = false;
          if (!sv.isiOS()) {
            var media_controls = $(
              [
                '<div class="sv-control-area">',
                '	<div class="sv-scrubbar">',
                '		<div class="sv-scrubbar-back">',
                '			<div class="sv-buffered"></div>',
                '			<div class="sv-played"></div>',
                '			<div class="sv-seeking"></div>',
                "		</div>",
                '		<div class="sv-switch-container">',
                '			<div class="sv-switch"></div>',
                '			<div class="sv-tooltip"></div>',
                "		</div>",
                "	</div>",
                '	<div class="sv-controls">',
                '		<div class="sv-lc sv-button sv-playpause">',
                '			<div class="sv-button-tag">play</div>',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '		<div class="sv-lc sv-button sv-prev">',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '		<div class="sv-lc sv-button sv-next">',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '		<div class="sv-lc sv-button sv-mute">',
                '			<div class="sv-button-tag">mute</div>',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '		<div class="sv-lc sv-volume">',
                '			<div class="sv-volume-back">',
                '				<div class="sv-volume-level"></div>',
                "  			</div>",
                '			<div class="sv-volume-switch"></div>',
                "		</div>",
                '		<div class="sv-time-container sv-lc">',
                '			<div class="sv-time">00:00</div> / <div class="sv-duration">00:00</div>',
                "		</div>",
                '		<div class="sv-fullscreen sv-button sv-rc">',
                '			<div class="sv-button-tag">fullscreen</div>',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '		<div class="sv-chromecast sv-button sv-rc">',
                '			<div class="sv-button-tag">cast</div>',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '       <div class="sv-airplay sv-button sv-rc">',
                '           <div class="sv-button-tag">airplay</div>',
                '           <div class="sv-button-icon"></div>',
                "       </div>",
                '		<div class="sv-cc sv-button sv-rc">',
                '			<div class="sv-button-tag">subtitles</div>',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '		<div class="sv-quality sv-button sv-rc">',
                '			<div class="sv-button-tag">quality</div>',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                '		<div class="sv-audio-track sv-button sv-rc">',
                '			<div class="sv-button-tag">audio track</div>',
                '			<div class="sv-button-icon"></div>',
                "		</div>",
                "	</div>",
                "</div>",
              ].join("\n")
            );

            if (sv.subtitles) {
              $(".sv-cc", media_controls).show();
              var first = true;

              for (title in sv.subtitles) {
                v.append(
                  '<track src="' +
                    sv.subtitles[title] +
                    '" kind="subtitles" srclang="en" label="' +
                    title +
                    '" ' +
                    (first ? "default" : "") +
                    " />"
                );
                $("track", v)[0].track.mode = first ? "showing" : "disabled";
                first = false;
              }

              var sub_menu = $("<ul />", {
                class: "sv-button-menu sv-button-menu-subs",
              });
              var first = true;
              sub_menu.append(
                '<li class="sv-button-menu-subs-buttons"><button class="button tiny"><i class="fa fa-upload sv-menu-add-subs"></i> Add</button> | <button class="button tiny sv-menu-search-subs"><i class="fa fa-search"></i> Search</button></li>'
              );
              for (title in sv.subtitles) {
                sub_menu.append(
                  "<li" +
                    (first ? ' class="active"' : "") +
                    ">" +
                    title +
                    "</li>"
                );
                first = false;
              }
              sub_menu.append(
                '<li class="sv-disable-subs">Hide Subs<i class="fa fa-times" style="margin-left: 10px;"></i></li>'
              );

              $(".sv-cc", media_controls).append(sub_menu);
            }
            // detect exit fullscreen

            function exitHandler() {
              if (
                !(
                  document.fullscreenElement ||
                  document.webkitIsFullScreen === true ||
                  document.mozFullScreen === true ||
                  document.msFullscreenElement
                )
              ) {
                is_fullscreen = false;
                if (subtitles_search_button) {
                  subtitles_search_button.show();
                }
                fullscreen_video_container.css("display", "block");
                p.removeClass("fullscreen");

                fullscreen_video_container.hide();
              } else {
                fullscreen_video_container.show();
              }
            }

            if (document.addEventListener) {
              document.addEventListener(
                "webkitfullscreenchange",
                exitHandler,
                false
              );
              document.addEventListener(
                "mozfullscreenchange",
                exitHandler,
                false
              );
              document.addEventListener("fullscreenchange", exitHandler, false);
              document.addEventListener(
                "MSFullscreenChange",
                exitHandler,
                false
              );
            }
            $(".sv-fullscreen", media_controls).on("click", function () {
              var elem = p[0];
              if (
                (document.fullscreenEnabled ||
                  document.webkitFullscreenEnabled ||
                  document.mozFullScreenEnabled ||
                  document.msFullscreenEnabled) &&
                !is_android_native
              ) {
                if (
                  document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement ||
                  document.msFullscreenElement
                ) {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                  } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                  } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                  }
                  is_fullscreen = false;
                  p.removeClass("fullscreen");
                } else {
                  if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                  } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                  } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                  } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                  }
                  is_fullscreen = true;
                  p.addClass("fullscreen");
                }
              } else {
                if (p.parent().is(parent)) {
                  p.appendTo(fullscreen_video_container);
                  fullscreen_video_container.css("display", "block");
                } else {
                  p.appendTo(parent);
                  fullscreen_video_container.css("display", "none");
                }
                is_fullscreen = false;
                p.removeClass("fullscreen");
              }

              showControls();
              if (is_fullscreen) {
                subtitles_search_button.hide();
              } else {
                subtitles_search_button.show();
              }
            });
            media_controls.on("click", function (e) {
              e.stopPropagation();
            });

            $(".sv-playpause", media_controls).on("click", function () {
              if (sv.casting) {
                if (
                  seedr_chromecast.currentMediaSession.playerState == "PAUSED"
                ) {
                  $(this).addClass("playing");
                  seedr_chromecast.play();
                } else {
                  $(this).removeClass("playing");
                  seedr_chromecast.pause();
                }
              } else {
                if (!sv.player.paused) {
                  sv.pause();
                } else {
                  sv.play();
                }
              }
            });

            $(".sv-chromecast", media_controls).on("click", function () {
              if (!seedr_chromecast.session) {
                seedr_chromecast.launchApp();
              } else {
                seedr_chromecast.connected_callback("CHROMECAST");
              }
            });

            $(".sv-airplay", media_controls).on("click", function () {
              sv.player.webkitShowPlaybackTargetPicker();
            });

            $(".sv-chromecast-overlay", "#" + sv.elem_id).click(function () {
              $(".sv-playpause", media_controls).click();
            });

            if (typeof chrome !== "undefined") {
              if (chrome.cast) {
                $(".sv-chromecast", media_controls).show();
              }
            }

            if (false) {
              //window.WebKitPlaybackTargetAvailabilityEvent) {
              $(".sv-airplay", media_controls).show();
            }

            $(".sv-mute", media_controls).on("click", function () {
              if ($(sv.player).prop("muted")) {
                $(sv.player).prop("muted", false);
                $(this).removeClass("muted");
                v.trigger("volumechange");
              } else {
                $(sv.player).prop("muted", true);
                $(this).addClass("muted");

                $(".sv-volume-level", media_controls).css("width", "0");
                $(".sv-volume-switch", media_controls).css("left", "0");
              }
            });

            $(".sv-cc", media_controls).on("click", function () {
              if ($(".sv-button-menu-subs", media_controls).length) {
                $(".sv-button-menu-subs", media_controls).toggle();
              } else {
                $(this).toggleClass("disabled");
                $("track", sv.player)[0].track.mode =
                  $("track", sv.player)[0].track.mode == "disabled"
                    ? "showing"
                    : "disabled";

                if (sv.casting) {
                  seedr_chromecast.setActiveSubtitles(
                    $("track", sv.player)[0].track.mode == "disabled" ? -1 : 0
                  );
                }
              }
            });

            $(".sv-cc", media_controls).on(
              "click",
              ".sv-button-menu-subs li",
              {},
              function () {
                if (offset_running) return;
                if ($(this).is(".sv-button-menu-subs-buttons")) return;

                var idx = $(this).index() - 1;
                for (var i = 0; i < $("track", sv.player).length; i++) {
                  $("track", sv.player)[i].track.mode = "disabled";
                  $(this)
                    .closest(".sv-button-menu-subs")
                    .find("li")
                    .removeClass("active");
                }
                if (!$(this).is(".sv-disable-subs")) {
                  $("track", sv.player)[idx].track.mode = "showing";
                }

                if (sv.casting) {
                  seedr_chromecast.setActiveSubtitles(
                    $(this).is(".sv-disable-subs") ? -1 : idx
                  );
                }

                $(this).addClass("active");

                origStarts = [];
                origEnds = [];
                offset_running = false;
                $(".sv-cc-sync", p).val(0);
              }
            );

            $(".sv-cc", media_controls).on(
              "click",
              ".sv-button-menu-subs-buttons button",
              {},
              function () {
                if ($(this).is(".sv-menu-search-subs")) {
                  // show search subs
                  $(this)
                    .closest(".sv-html5-video-container")
                    .find(".sv-subtitles-search")
                    .click();
                } else {
                  // show add subs
                  $(this)
                    .closest(".sv-html5-video-container")
                    .find(".sv-subs-upload-container")
                    .addClass("shown");
                }
              }
            );

            $(".sv-cc-sync input")
              .on("change", function (e) {
                sv.offsetSubs(parseFloat($(this).val()));
              })
              .on("keydown", function (e) {
                e.stopPropagation();
              });

            p.append(media_controls);

            p.on("mousemove mousedown", function () {
              showControls();
            });

            v.on("click", function (e) {
              if ($(e.target).closest(".sv-scrubbar").length == 0) {
                if (!sv.player.paused) {
                  sv.pause();
                } else {
                  sv.play();
                }
                showControls();
              }
            }).on("dblclick", function (e) {
              if (device_type == "mobile") {
                var width = v.width();
                var left = e.offsetX;

                if (left / width < 0.5) {
                  v[0].currentTime -= 20;
                } else {
                  v[0].currentTime += 20;
                }
              } else {
                if ($(e.target).closest(".sv-scrubbar").length == 0) {
                  e.preventDefault();
                  $(".sv-fullscreen", media_controls).click();
                }
              }
            });

            v.on("timeupdate progress", function () {
              if (!sv.casting) {
                sv.showTime(v[0].currentTime);
              }

              if (
                v[0].currentTime >= v[0].duration - 0.3 &&
                !$(this).closest("#video-modal.converting").length &&
                v[0].duration > 10
              ) {
                $(".player-finished").show();
              } else {
                $(".player-finished").hide();
              }
            }).on("volumechange", function () {
              if (!sv.casting) {
                var vol = v[0].muted ? 0 : v[0].volume;
                $(".sv-volume-level", media_controls).css(
                  "width",
                  vol * 100 + "%"
                );
                $(".sv-volume-switch", media_controls).css(
                  "left",
                  vol * 100 + "%"
                );
              }
            });

            $(".player-finished", p).on("click", function () {
              $(this).hide();
              v[0].currentTime = 0;
              sv.play();
            });

            var svv = $(".sv-volume", media_controls);
            var sb = $(".sv-scrubbar", media_controls);

            $(function () {
              var leftButtonDown = false;
              $(document).mousedown(function (e) {
                // Left mouse button was pressed, set flag
                if (e.which === 1) leftButtonDown = true;
              });
              $(document).mouseup(function (e) {
                // Left mouse button was released, clear flag
                if (e.which === 1) leftButtonDown = false;
              });

              function tweakMouseMoveEvent(e) {
                // If left button is not set, set which to 0
                // This indicates no buttons pressed
                if (e.which === 1 && !leftButtonDown && e.type !== "mousedown")
                  e.which = 0;
              }

              sb.on("mousedown mousemove", function (e) {
                if (v[0].duration) {
                  var r = (e.pageX - sb.offset().left) / sb.width();
                  var t = r * v[0].duration;
                  tweakMouseMoveEvent(e);
                  $(".sv-seeking", media_controls).width(r * 100 + "%");
                  $(".sv-tooltip", media_controls)
                    .css("left", r * 100 + "%")
                    .text(
                      dayjs.utc(t * 1000).format(t > 3600 ? "H:mm:ss" : "m:ss")
                    );

                  if (e.which == 1 || e.type == "mousedown") {
                    sv.showTime(t);
                    if (sv.casting) {
                      seedr_chromecast.seek(t);
                      seedr_chromecast.play();
                    } else {
                      v[0].currentTime = t;
                      setTimeout(sv.play, 10);
                    }
                  }
                }
              });

              svv.on("mousedown mousemove", function (e) {
                tweakMouseMoveEvent(e);
                if (e.which == 1) {
                  var r = (e.pageX - svv.offset().left) / svv.width();
                  r = r > 1 ? 1 : r;

                  if (sv.casting) {
                    seedr_chromecast.setVolume(r);
                  }

                  v[0].volume = r;
                  v[0].muted = false;

                  $(".sv-mute", media_controls).removeClass("muted");
                  $(".sv-volume-level", media_controls).css(
                    "width",
                    r * 100 + "%"
                  );
                  $(".sv-volume-switch", media_controls).css(
                    "left",
                    r * 100 + "%"
                  );
                }
              });
            });

            v.trigger("volumechange");
          }

          // Check if video is buffering - if it is display buffering control
          var checkInterval = 300.0;
          var lastPlayPos = 0;
          var currentPlayPos = 0;
          var bufferingDetected = false;
          sv.buffering_timer = setInterval(function () {
            currentPlayPos = sv.player.currentTime;

            // checking offset, e.g. 1 / 50ms = 0.02
            var offset = 5 / 1000;

            // if no buffering is currently detected,
            // and the position does not seem to increase
            // and the player isn't manually paused...
            if (
              !bufferingDetected &&
              currentPlayPos < lastPlayPos + offset &&
              !sv.player.paused
            ) {
              $(".sv-buffering-div", p).fadeIn();
              bufferingDetected = true;
            } else if (
              currentPlayPos > lastPlayPos + offset ||
              sv.player.paused
            ) {
              $(".sv-buffering-div", p).fadeOut();
              bufferingDetected = false;
            }
            lastPlayPos = currentPlayPos;
          }, checkInterval);
        } else {
          var parameters = {
            src: sv.current_media,
            verbose: true,
            javascriptCallbackFunction: "SeedrVideo.prototype.jsbridge",
            plugin_hls: "/swf/flashlsOSMF.swf",
            streamType: "dvr",
            hls_minbufferlength: -1,
            hls_maxbufferlength: 280,
            hls_lowbufferlength: 3,
            hls_seekmode: "ACCURATE",
            hls_startfromlevel: -1,
            hls_seekfromlevel: -1,
            hls_live_flushurlcache: false,
            hls_info: false,
            hls_debug: false,
            hls_debug2: false,
            hls_warn: true,
            hls_error: true,
            hls_fragmentloadmaxretry: -1,
            hls_manifestloadmaxretry: -1,
            hls_capleveltostage: false,
            hls_maxlevelcappingmode: "downscale",
            is_paid: sv.is_paid,
            is_chromeless: sv.is_chromeless,
            bgcolor: "#000000",
          };

          if (sv.subtitles) {
            parameters["src_http://kutu.ru/osmf/plugins/subtitles"] =
              sv.getFlashSubtitlesJSON(sv.subtitles);
          }

          var wmodeValue = this.isFirefox() ? "opaque" : "direct"; //(sv.is_chromeless ? "opaque" : "direct");
          var wmodeOptions = ["direct", "opaque", "transparent", "window"];
          if (parameters.hasOwnProperty("wmode")) {
            if (wmodeOptions.indexOf(parameters.wmode) >= 0) {
              wmodeValue = parameters.wmode;
            }
            delete parameters.wmode;
          }

          // Embed the player SWF:
          swfobject.embedSWF(
            "/seedr_video/seedr_video.swf?v=0.7",
            this.elem_id,
            this.width,
            this.height,
            "11.0",
            "/swf/expressinstall.swf",
            parameters,
            {
              allowFullScreen: "true",
              wmode: wmodeValue,
            }
          );
        }
      };

      this.chromecastConnecting = function (name) {
        $(".sv-chromecast-overlay", "#" + sv.elem_id).addClass("shown");
        $(".sv-chromecast-state", "#" + sv.elem_id).text(
          "Chromecast Connecting ..."
        );
      };

      this.chromecastConnected = function () {
        sv.player.pause();
        $(".sv-chromecast-state", "#" + sv.elem_id).text("Connected");
        $(".sv-chromecast", "#" + sv.elem_id).addClass("casting");
        $(".sv-playpause", "#" + sv.elem_id).addClass("playing");
      };

      this.chromecastTimeUpdated = function (time) {
        sv.showTime(time);
      };

      this.chromecastPlaying = function () {
        $(".sv-chromecast-state", "#" + sv.elem_id).text("Playing");
        $(".sv-playpause", "#" + sv.elem_id).addClass("playing");
      };

      this.chromecastPaused = function () {
        $(".sv-chromecast-state", "#" + sv.elem_id).text("Paused");
        $(".sv-playpause", "#" + sv.elem_id).removeClass("playing");
      };

      this.chromecastDisconnected = function () {
        $(".sv-chromecast-overlay", "#" + sv.elem_id).removeClass("shown");
      };

      this.initPlayer();

      if (typeof chrome !== "undefined" && params.has_chromecast) {
        var connected_callback = function (name) {
          sv.casting = true;
          if (sv.is_html()) {
            sv.chromecastConnecting(name);
            sv.chromecastConnected();
          } else {
            sv.player.chromecastConnecting(name);
            sv.player.chromecastConnected();
          }

          var s = [];
          s = $.extend(s, sv.subtitles);
          s = $.extend(s, sv.os_subtitles);

          seedr_chromecast.loadMedia(
            sv.current_media,
            sv.current_title,
            false,
            s,
            0
          );
        };

        var disconnected_callback = function () {
          if (sv.is_html()) {
            sv.chromecastDisconnected();
          } else {
            sv.player.chromecastDisconnected();
          }
        };

        var media_status_callback = function (
          playerState,
          currentTime,
          duration
        ) {
          if (sv.is_html()) {
            if (playerState == "PLAYING") sv.chromecastPlaying();
            if (playerState == "PAUSED") sv.chromecastPaused();
            sv.chromecastTimeUpdated(currentTime);
          } else {
            if (playerState == "PLAYING") sv.player.chromecastPlaying();
            if (playerState == "PAUSED") sv.player.chromecastPaused();
            sv.player.chromecastTimeUpdated(currentTime);
          }
        };

        var time_callback = function (time) {
          if (sv.is_html()) {
            sv.chromecastTimeUpdated(time);
          } else {
            sv.player.chromecastTimeUpdated(time);
          }
        };

        var loaded_callback = function () {
          if (sv.is_html()) {
            $(".sv-chromecast", "#" + sv.elem_id).show();
          }
        };

        if (!seedr_chromecast) {
          seedr_chromecast = new SeedrChromecast({
            connected_callback: connected_callback,
            disconnected_callback: disconnected_callback,
            media_status_callback: media_status_callback,
            time_callback: time_callback,
            loaded_callback: loaded_callback,
          });
        } else {
          seedr_chromecast.connected_callback = connected_callback;
          seedr_chromecast.disconnected_callback = disconnected_callback;
          seedr_chromecast.media_status_callback = media_status_callback;
          seedr_chromecast.time_callback = time_callback;
          seedr_chromecast.loaded_callback = loaded_callback;

          if (seedr_chromecast.cast_loaded) {
            if (sv.is_html()) {
              $(".sv-chromecast", "#" + sv.elem_id).show();
            }
          }

          if (seedr_chromecast.session) {
            if (seedr_chromecast.session.media.length != 0) {
              sv.casting = true;
              sv.pause();
              seedr_chromecast.connected_callback();
            }
          }
        }
      }
    };

    SeedrVideo.instances = {};

    SeedrVideo.prototype.jsbridge = function (playerId, event, data) {
      var p = SeedrVideo.instances[playerId];
      switch (event) {
        case "onJavaScriptBridgeCreated":
          p.player = $("#" + playerId)[0];
          break;
        case "chromecastConnect":
          p.seedr_chromecast.launchApp();
          break;
        case "chromecastDisconnect":
          p.seedr_chromecast.stopApp();
          break;
        case "chromecastPlay":
          p.seedr_chromecast.play();
          break;
        case "chromecastPause":
          p.seedr_chromecast.pause();
          break;
        case "chromecastSeek":
          p.seedr_chromecast.seek(data[0]);
          break;
        case "chromecastSetVolume":
          p.seedr_chromecast.setVolume(data[0]);
          break;
        case "chromecastMute":
          p.seedr_chromecast.mute();
          break;
        case "mediaSize":
          if (!p.post_init) {
            if (typeof chrome !== "undefined") {
              if (chrome.cast) {
                p.player.chromecastInit();
              }
            }
            p.post_init = true;
          }

          if (p.video_seek_to != -1 && !!data.videoWidth) {
            p.player.seek(p.video_seek_to);
            p.video_seek_to = -1;
            if (p.casting) {
              p.player.chromecastConnected();
            }
          }
          break;
        case "subtitlesSearchClicked":
          if (typeof SeedrVideo.subtitles_search_callback !== "undefined") {
            SeedrVideo.subtitles_search_callback();
          }
          break;
        case "subtitlesSwitchingChange":
          if (p.casting) {
            p.seedr_chromecast.setActiveSubtitles(
              $("#" + playerId)[0].getCurrentSubtitlesStreamIndex()
            );
          }
          break;
      }
      if (
        event != "progress" &&
        event != "timeChange" &&
        event != "durationChange"
      )
        console.log(event, data);
    };

    SeedrVideo.subtitles_search_callback = function () {
      $("#video-modal-closed-captions").click();
    };

    var sv = function (name) {
      return SeedrVideo.instances[name];
    };

    sv.can_dvr = function () {
      var is_ios = navigator.userAgent.match(/iPad|iPhone|iPod/g)
        ? true
        : false;
      var is_safari = /^((?!chrome).)*safari/i.test(navigator.userAgent);
      var is_hls = Hls.isSupported();
      var is_ps4 = navigator.userAgent.match(/PlayStation/g) ? true : false;
      var is_samsung = navigator.userAgent.match(/SamsungBrowser/i);
      return is_ios || is_safari || is_hls || is_ps4 || is_samsung;
    };

    Object.assign(window, {
      SeedrChromecast,
      seedr_chromecast,
      SeedrVideo,
      sv,
    });
  }
})();
