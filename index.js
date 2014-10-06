 $(document).ready(function(){

      $(function init(){


      $('#nave').css({
        'float':'right',
        'margin-top':'20px',
        'margin-right':'100px',
        'width':'60px',
        'height':'80px'
      });

      $('#nave').animate({
        'margin-top': '400px',
        'width':'130px',
        'height':'170px'
      }, 500);

      $('#nave').animate({
        'margin-right':'800px',
        'width':'200px',
        'height':'240px',
      }, 500);
  
      });

     
      $(function down(){        
        $('#button').animate({
          'margin-top':'150px'
      }, 2000);

      });

      

      $(function goToGame(){
       $('#button').click(function(){
          $(location).attr('href','pagegame.html');
      });

      });


      $(function down(){        
        $('#button2').animate({
          'margin-top':'285px'
      }, 2000);

      });

      

      $(function goToInstructions(){
       $('#button2').click(function(){
          $(location).attr('href','instructions.html');
      });

      });


      $(function down(){        
        $('#button3').animate({
          'margin-top':'400px'
      }, 2000);

      });

      

      $(function goToCredits(){
       $('#button3').click(function(){
          $(location).attr('href','credits.html');
      });

      });





      
    });    

