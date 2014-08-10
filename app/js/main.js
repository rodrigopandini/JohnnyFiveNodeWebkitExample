var Readable = require('stream').Readable;
var util = require('util');
util.inherits(MyStream, Readable);
function MyStream(opt) {
  Readable.call(this, opt);
}
MyStream.prototype._read = function() {};
// hook in our stream
process.__defineGetter__('stdin', function() {
  if (process.__stdin) return process.__stdin;
  process.__stdin = new MyStream();
  return process.__stdin;
});


// node-webkit
var gui = require('nw.gui');
var win = gui.Window.get();

// show devtools to debug
win.showDevTools();

// johnny-five
var five = require('johnny-five'),
    board,
    led,
    motor;

// serialport
var serialPort = require('johnny-five/node_modules/serialport');

// init
document.addEventListener('DOMContentLoaded', function() {
  // close window button
  $('#closeWindow').click(function(){
    win.close();
  });

  // menu links - to display Led or Motor area
  $('#linkLed').click(function(){
    $('#containerMotor').hide();
    $('#linkMotor').removeClass('active');
    $('#containerLed').show();
    $('#linkLed').addClass('active');
  });
  $('#linkMotor').click(function(){
    $('#containerLed').hide();
    $('#linkLed').removeClass('active');
    $('#containerMotor').show();
    $('#linkMotor').addClass('active');
  });

  // led button
  $('#btnToggleLed').click(function(){
    if(led.isOn){
      led.off();
      $('#led').removeClass('led-on');
      $(this).removeClass('btn-primary').text('Turn On');
    }
    else{
      led.on();
      $('#led').addClass('led-on');
      $(this).addClass('btn-primary').text('Turn Off');
    }
  });

  // motor button
  $('#btnToggleMotor').click(function(){
    if(motor.isOn){
      motor.stop();
      $('#motor').removeClass('fa-spin');
      $(this).removeClass('btn-primary').text('Turn On');
    }
    else{
      motor.start();
      $('#motor').addClass('fa-spin');
      $(this).addClass('btn-primary').text('Turn Off');
    }
  });

  // list all avaliable serial ports in the serialports button
  // user choose the port where Arduino board is connected
  var html = '';
  serialPort.list(function (err, ports) {

    ports.forEach(function(p) {
      var portName = p.comName.toString();
      html += '<li id="port'+portName+'"><a href="#">'+portName+'</a></li>';
      // when user select the port
      $('#serialPorts').on('click', '#port'+portName, p, function(data){

        $('#labelPort').removeClass('btn-primary').addClass('btn-default');
        $('#labelPort').html('<i class="fa fa-circle-o-notch fa-spin"></i>');

        // create the board connected to the port selected
        board = new five.Board({port: portName});

        // when board is ready
        board.on('ready', function() {
          // create Led component connected to the pin 13
          led = new five.Led({
            pin: 13
          });
          // create Motor component connected to the pin 5
          motor = new five.Motor({
            pin: 5
          });
          // and inject Led and Motor in the Repl of the board
          board.repl.inject({
            led: led,
            motor: motor
          });

          // show serial port name
          $('#labelPort').text(portName);
          $('#labelPort').removeClass('btn-default').addClass('btn-primary');
        });

        // when serial port error
        board.on('error', function(err){
          // show error message
          $('#labelPort').removeClass('btn-primary btn-default').addClass('btn-danger');
          $('#labelPort').text('Error!');
          // remove error message and return to normal state
          setTimout(function(){
            $('#labelPort').removeClass('btn-danger').addClass('btn-default');
            $('#labelPort').text('Ports');
          }, 5000);
        });

      });

    });

    // show serial ports names
    $('#serialPorts').html(html);

  });

});
