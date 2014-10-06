
var PLAYGROUND_WIDTH	= 900;
var PLAYGROUND_HEIGHT	= 450;
var REFRESH_RATE		= 15;

var GRACE		= 2000;
var MISSILE_SPEED = 10; 

var smallStarSpeed    	= 5 
var mediumStarSpeed		= 15 
var bigStarSpeed		= 30 

var playerAnimation = new Array();
var missile = new Array();
var enemies = new Array(3); 

var bossMode = false;
var bossName = null;
var playerHit = false;
var timeOfRespawn = 0;
var gameOver = false;

function restartgame(){
	window.location.reload();
};

function explodePlayer(playerNode){
	playerNode.children().hide();
	playerNode.addSprite("explosion",{animation: playerAnimation["explode"], width: 100, height: 26})
	playerHit = true;
}

function Player(node){

	this.node = node;
	this.grace = false;
	this.replay = 3; 
	this.shield = 3; 
	this.respawnTime = -1;
	
	this.damage = function(){
		if(!this.grace){
			this.shield--;
			if (this.shield == 0){
				return true;
			}
			return false;
		}
		return false;
	};

	this.respawn = function(){
		this.replay--;
		if(this.replay==0){
			return true;
		}
		
		this.grace 	= true;
		this.shield	= 3;
		
		this.respawnTime = (new Date()).getTime();
		$(this.node).fadeTo(0, 0.5); 
		return false;
	};
	
	this.update = function(){
		if((this.respawnTime > 0) && (((new Date()).getTime()-this.respawnTime) > 3000)){
			this.grace = false;
			$(this.node).fadeTo(500, 1); 
			this.respawnTime = -1;
		}
	}
	return true;
}

function Enemy(node){
	this.shield	= 2;
	this.speedx	= -5;
	this.speedy	= 0;
	this.node = $(node);

	this.damage = function(){
		this.shield--;
		if(this.shield == 0){
			return true;
		}
		return false;
	};

	this.update = function(playerNode){
		this.updateX(playerNode);
		this.updateY(playerNode);
	};	
	this.updateX = function(playerNode){
		this.node.x(this.speedx, true);
	};
	this.updateY= function(playerNode){
		var newpos = parseInt(this.node.css("top"))+this.speedy;
		this.node.y(this.speedy, true);
	};
}

function Minion(node){
	this.node = $(node);
}
Minion.prototype = new Enemy();
Minion.prototype.updateY = function(playerNode){
	
	if(this.node.y() > (PLAYGROUND_HEIGHT - 100)){
		this.node.y(-2, true)
	}
}

function Pinion(node){
	this.node = $(node);
	this.speedy = 1;
	this.alignmentOffset = 10;
}
Pinion.prototype = new Enemy();

var direccion = 1;
Pinion.prototype.updateY = function(playerNode){
	
	// va hacia arriba
	if(this.node.y() < 50){
		direccion = 1;
	} else if(this.node.y() > 400) {
		direccion = 0;
	}
	
	if(direccion==1)
	{
		this.node.y(+3, true);
	}
	else
	{
		this.node.y(-3, true);
	}
	
	console.log(this.node.y()+this.alignmentOffset);
}

function Brainy(node){
	this.node = $(node);
	this.shield	= 5;
	this.speedy = 1;
	this.alignmentOffset = 5;
}
Brainy.prototype = new Enemy();
Brainy.prototype.updateY = function(playerNode){
	if((this.node.y()+this.alignmentOffset) > $(playerNode).y()){
		this.node.y(-this.speedy, true);
	} else if((this.node.y()+this.alignmentOffset) < $(playerNode).y()){
		this.node.y(this.speedy, true);
	}
}

function Bossy(node){
	this.node = $(node);
	this.shield	= 20;
	this.speedx = -1;
	this.alignmentOffset = 35;
}
Bossy.prototype = new Brainy();
Bossy.prototype.updateX = function(){
	if(this.node.x() > (PLAYGROUND_WIDTH - 200)){
		this.node.x(this.speedx, true)
	}
}

$(function(){
	
	// fondos
	var background1 = new $.gQ.Animation({imageURL: "background1.png"});
	var background2 = new $.gQ.Animation({imageURL: "background2.png"}); 
	var background3 = new $.gQ.Animation({imageURL: "background3.png"});
	var background4 = new $.gQ.Animation({imageURL: "background4.png"});
	var background5 = new $.gQ.Animation({imageURL: "background5.png"});
	var background6 = new $.gQ.Animation({imageURL: "background6.png"});
 
	// animaciones jugadores
	playerAnimation["idle"]		= new $.gQ.Animation({imageURL: "player_spaceship.png"});
	playerAnimation["explode"]	= new $.gQ.Animation({imageURL: "player_explode.png", numberOfFrame: 4, delta: 26, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	playerAnimation["up"]		= new $.gQ.Animation({imageURL: "boosterup.png", numberOfFrame: 6, delta: 14, rate: 60, type: $.gQ.ANIMATION_HORIZONTAL});
	playerAnimation["down"]		= new $.gQ.Animation({imageURL: "boosterdown.png", numberOfFrame: 6, delta: 14, rate: 60, type: $.gQ.ANIMATION_HORIZONTAL});
	playerAnimation["boost"]	= new $.gQ.Animation({imageURL: "booster1.png" , numberOfFrame: 6, delta: 14, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	playerAnimation["booster"]	= new $.gQ.Animation({imageURL: "booster2.png", numberOfFrame: 6, delta: 14, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	
	//  animaciones enemigos
	// enemigo 1
	enemies[0] = new Array(); 
	enemies[0]["idle"]	= new $.gQ.Animation({imageURL: "minion_idle.png", numberOfFrame: 5, delta: 52, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	enemies[0]["explode"]	= new $.gQ.Animation({imageURL: "minion_explode.png", numberOfFrame: 11, delta: 52, rate: 30, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// enemigo nuevo agregado
	enemies[3] = new Array();
	enemies[3]["idle"]	= new $.gQ.Animation({imageURL: "pinion_idle.png", numberOfFrame: 5, delta: 52, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	enemies[3]["explode"]	= new $.gQ.Animation({imageURL: "pinion_explode.png", numberOfFrame: 11, delta: 52, rate: 30, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// segundo
	enemies[1] = new Array();
	enemies[1]["idle"]	= new $.gQ.Animation({imageURL: "brainy_idle.png", numberOfFrame: 8, delta: 42, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	enemies[1]["explode"]	= new $.gQ.Animation({imageURL: "brainy_explode.png", numberOfFrame: 8, delta: 42, rate: 60, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// tercero
	enemies[2] = new Array();
	enemies[2]["idle"]	= new $.gQ.Animation({imageURL: "bossy_idle.png", numberOfFrame: 5, delta: 100, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	enemies[2]["explode"]	= new $.gQ.Animation({imageURL: "bossy_explode.png", numberOfFrame: 9, delta: 100, rate: 60, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// misil
	missile["player"] = new $.gQ.Animation({imageURL: "player_missile.png", numberOfFrame: 6, delta: 10, rate: 90, type: $.gQ.ANIMATION_VERTICAL});
	missile["enemies"] = new $.gQ.Animation({imageURL: "enemy_missile.png", numberOfFrame: 6, delta: 15, rate: 90, type: $.gQ.ANIMATION_VERTICAL});
	missile["playerexplode"] = new $.gQ.Animation({imageURL: "player_missile_explode.png" , numberOfFrame: 8, delta: 23, rate: 90, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	missile["enemiesexplode"] = new $.gQ.Animation({imageURL: "enemy_missile_explode.png" , numberOfFrame: 6, delta: 15, rate: 90, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true});

	$.playground().addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background1", {animation: background1, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background2", {animation: background2, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
						.addSprite("background3", {animation: background3, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background4", {animation: background4, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
						.addSprite("background5", {animation: background5, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background6", {animation: background6, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
					.end()
					.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addGroup("player", {posx: PLAYGROUND_WIDTH/2, posy: PLAYGROUND_HEIGHT/2, width: 100, height: 26})
							.addSprite("playerBoostUp", {posx:37, posy: 15, width: 14, height: 18})
							.addSprite("playerBody",{animation: playerAnimation["idle"], posx: 0, posy: 0, width: 100, height: 26})
							.addSprite("playerBooster", {animation:playerAnimation["boost"], posx:-32, posy: 5, width: 36, height: 14})
							.addSprite("playerBoostDown", {posx:37, posy: -7, width: 14, height: 18})
						.end()
					.end()
					.addGroup("playerMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
					.addGroup("enemiesMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
					.addGroup("overlay",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});
	
	$("#player")[0].player = new Player($("#player"));

	$("#overlay").append("<div id='shieldHUD'style='color: white; width: 100px; position: absolute; font-family: verdana, sans-serif;'></div><div id='lifeHUD'style='color: white; width: 100px; position: absolute; right: 0px; font-family: verdana, sans-serif;'></div>")

	$.loadCallback(function(percent){
		$("#loadingBar").width(400*percent);
	});

	$("#startbutton").click(function(){
		$.playground().startGame(function(){
			$("#welcomeScreen").fadeTo(1000,0,function(){$(this).remove();});
		});
	})

	$.playground().registerCallback(function(){
		if(!gameOver){
			$("#shieldHUD").html("shield: "+$("#player")[0].player.shield);
			$("#lifeHUD").html("life: "+$("#player")[0].player.replay);
			// movemos la nave
			if(!playerHit){
				$("#player")[0].player.update();
				if(jQuery.gameQuery.keyTracker[65]){ // izquierda (a)
					var nextpos = $("#player").x()-10;
					if(nextpos > 0){
						$("#player").x(nextpos);
					}
				}
				if(jQuery.gameQuery.keyTracker[68]){ // derecha (d)
					var nextpos = $("#player").x()+10;
					if(nextpos < PLAYGROUND_WIDTH - 100){
						$("#player").x(nextpos);
					}
				}
				if(jQuery.gameQuery.keyTracker[87]){ // arriba (w)
					var nextpos = $("#player").y()-3;
					if(nextpos > 0){
						$("#player").y(nextpos);
					}
				}
				if(jQuery.gameQuery.keyTracker[83]){ // abajo (s)
					var nextpos = $("#player").y()+3;
					if(nextpos < PLAYGROUND_HEIGHT - 30){
						$("#player").y(nextpos);
					}
				}
			} else {
				var posy = $("#player").y()+5;
				var posx = $("#player").x()-5;
				if(posy > PLAYGROUND_HEIGHT){
					// mira que no se salga de la pantalla
					if($("#player")[0].player.respawn()){
						gameOver = true;
						$("#playground").append('<div style="position: absolute; top: 50px; width: 700px; color: white; font-family: verdana, sans-serif;"><center><h1>Game Over</h1><br><a style="cursor: pointer;" id="restartbutton">Click here to restart the game!</a></center></div>');
						$("#restartbutton").click(restartgame);
						$("#actors,#playerMissileLayer,#enemiesMissileLayer").fadeTo(1000,0);
						$("#background").fadeTo(5000,0);
					} else {
						$("#explosion").remove();
						$("#player").children().show();
						$("#player").y(PLAYGROUND_HEIGHT / 2);
						$("#player").x(PLAYGROUND_WIDTH / 2);
						playerHit = false;
					}
				} else {
					$("#player").y(posy);
					$("#player").x(posx);
				}
			}
			
			// movimiento de los enemigos
			$(".enemy").each(function(){
					this.enemy.update($("#player"));
					var posx = $(this).x();
					if((posx + 100) < 0){
						$(this).remove();
						return;
					}
					// test de colisiones entre enemigos
					var collided = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
					if(collided.length > 0){
						if(this.enemy instanceof Bossy){
								$(this).setAnimation(enemies[2]["explode"], function(node){$(node).remove();});
								$(this).css("width", 150);
						} else if(this.enemy instanceof Brainy) {
							$(this).setAnimation(enemies[1]["explode"], function(node){$(node).remove();});
							$(this).css("width", 150);
						} else if(this.enemy instanceof Pinion) {
							$(this).setAnimation(enemies[3]["explode"], function(node){$(node).remove();});
							$(this).css("width", 200);
						} else {
							$(this).setAnimation(enemies[0]["explode"], function(node){$(node).remove();});
							$(this).css("width", 200);
						}
						$(this).removeClass("enemy");
						// si le da al usuario
						if($("#player")[0].player.damage()){
							explodePlayer($("#player"));
						}
					}
					// hacer disparar a los enemigos
					if(this.enemy instanceof Brainy){
						if(Math.random() < 0.05){
							var enemyposx = $(this).x();
							var enemyposy = $(this).y();
							var name = "enemiesMissile_"+Math.ceil(Math.random()*1000);
							$("#enemiesMissileLayer").addSprite(name,{animation: missile["enemies"], posx: enemyposx, posy: enemyposy + 20, width: 30,height: 15});
							$("#"+name).addClass("enemiesMissiles");
						}
					}
				});
			
			// movimiento de los misiles
			$(".playerMissiles").each(function(){
					var posx = $(this).x();
					if(posx > PLAYGROUND_WIDTH){
						$(this).remove();
						return;
					}
					$(this).x(MISSILE_SPEED, true);
					// mira si le da a alguien
					var collided = $(this).collision(".enemy,."+$.gQ.groupCssClass);
					if(collided.length > 0){
						// cuando le da a un enemigo
						collided.each(function(){
								if($(this)[0].enemy.damage()){
									if(this.enemy instanceof Bossy){
											$(this).setAnimation(enemies[2]["explode"], function(node){$(node).remove();});
											$(this).css("width", 150);
									} else if(this.enemy instanceof Brainy) {
										$(this).setAnimation(enemies[1]["explode"], function(node){$(node).remove();});
										$(this).css("width", 150);
									} else if(this.enemy instanceof Pinion) {
										$(this).setAnimation(enemies[0]["explode"], function(node){$(node).remove();});
										$(this).css("width", 200);
									} else {
										$(this).setAnimation(enemies[0]["explode"], function(node){$(node).remove();});
										$(this).css("width", 200);
									}
									$(this).removeClass("enemy");
								}
							})
						$(this).setAnimation(missile["playerexplode"], function(node){$(node).remove();});
						$(this).css("width", 38);
						$(this).css("height", 23);
						$(this).y(-7, true);
						$(this).removeClass("playerMissiles");
					}
				});
			$(".enemiesMissiles").each(function(){
					var posx = $(this).x();
					if(posx < 0){
						$(this).remove();
						return;
					}
					$(this).x(-MISSILE_SPEED, true);
					// mira si le da al jugador
					var collided = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
					if(collided.length > 0){
						// le da al jugador
						collided.each(function(){
								if($("#player")[0].player.damage()){
									explodePlayer($("#player"));
								}
							})
						$(this).remove();
						$(this).setAnimation(missile["enemiesexplode"], function(node){$(node).remove();});
						$(this).removeClass("enemiesMissiles");
					}
				});
		}
	}, REFRESH_RATE);
	
	// creacion de enemigos
	$.playground().registerCallback(function(){
		if(!bossMode && !gameOver){
			if(Math.random() < 0.2){
				var name = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: enemies[0]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 150, height: 52});
				$("#"+name).addClass("enemy");
				$("#"+name)[0].enemy = new Minion($("#"+name));
			} else if (Math.random() < 0.4) {
				var name = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: enemies[3]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 150, height: 52});
				$("#"+name).addClass("enemy");
				$("#"+name)[0].enemy = new Pinion($("#"+name));	

			} else if (Math.random() < 0.6){
				var name = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: enemies[1]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 100, height: 42});
				$("#"+name).addClass("enemy");
				$("#"+name)[0].enemy = new Brainy($("#"+name));
			} else if(Math.random() > 0.8){
				bossMode = true;
				bossName = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(bossName, {animation: enemies[2]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 100, height: 100});
				$("#"+bossName).addClass("enemy");
				$("#"+bossName)[0].enemy = new Bossy($("#"+bossName));
			}
		} else {
			if($("#"+bossName).length == 0){
				bossMode = false;
			}
		}
		
	}, 1000); // cada segundo
	
	
	// animacion de los fondos
	$.playground().registerCallback(function(){
		
		var newPos = ($("#background1").x() - smallStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background1").x(newPos);
		
		newPos = ($("#background2").x() - smallStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background2").x(newPos);
		
		newPos = ($("#background3").x() - mediumStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background3").x(newPos);
		
		newPos = ($("#background4").x() - mediumStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background4").x(newPos);
		
		newPos = ($("#background5").x() - bigStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background5").x(newPos);
		
		newPos = ($("#background6").x() - bigStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background6").x(newPos);
		
		
	}, REFRESH_RATE);
	
	// aqui se escucha al teclado
	$(document).keydown(function(e){
		if(!gameOver && !playerHit){
			switch(e.keyCode){
				case 75: //disparar (k)
					var playerposx = $("#player").x();
					var playerposy = $("#player").y();
					var name = "playerMissle_"+Math.ceil(Math.random()*1000);
					$("#playerMissileLayer").addSprite(name,{animation: missile["player"], posx: playerposx + 90, posy: playerposy + 14, width: 36,height: 10});
					$("#"+name).addClass("playerMissiles")
					break;
				case 65: // izq! (a)
					$("#playerBooster").setAnimation();
					break;
				case 87: // arriba! (w)
					$("#playerBoostUp").setAnimation(playerAnimation["up"]);
					break;
				case 68: // derecha (d)
					$("#playerBooster").setAnimation(playerAnimation["booster"]);
					break;
				case 83: // abajo (s)
					$("#playerBoostDown").setAnimation(playerAnimation["down"]);
					break;
			}
		}
	});
	// mas keyboard listening
	$(document).keyup(function(e){
		if(!gameOver && !playerHit){
			switch(e.keyCode){
				case 65: // izq (a)
					$("#playerBooster").setAnimation(playerAnimation["boost"]);
					break;
				case 87: // arriba (w)
					$("#playerBoostUp").setAnimation();
					break;
				case 68: // derecha (d)
					$("#playerBooster").setAnimation(playerAnimation["boost"]);
					break;
				case 83: // abajo (s)
					$("#playerBoostDown").setAnimation();
					break;
			}
		}
	});
});

