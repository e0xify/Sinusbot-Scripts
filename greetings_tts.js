registerPlugin({ // jshint ignore:line
  name: 'TTS Greetings',
  version: '1.1',
  description: 'Greetings with TTS!',
  author: 'Xuxe <xuxe@xuxe-network.eu>',
  vars: {

    text: {
      title: 'Text: ',
      type: 'string'
    },

  }

}, function(sinusbot, config) {


  if (config.text === undefined) {
    return;
  }


  //User anpassen mit %n
  var msg = config.text;
  msg = msg.replace('%n', ev.clientNick);



  sinusbot.on('clientMove', function(ev) {

    if (ev.newChannel == getCurrentChannelId()) {
      say(msg);
    }



  });


});