function Game2048()
{	
			var buttonPane;
			var canvas2048;
			var canvasNode;
			var scorePane;
			var controlPane;
			var numberArrayHistory;
			var numberArrayPos;
			var numberArray;
			var nodeArray;
			var score;
			var scoreNode;
			var rootNode;
			var gamectx;
			var scoreWidth;
			var direction;
			var serverArray;
			var ongoingTouches = new Array();
			var tileSize;
			var boardSize;
			var centreOffset;
			var scoreAreaHeight;
			var tileFontSize;
			var scoreFontSize;
			var nameFontSize;
			var lineWidth;
			var canvasWrapper;
			var buttonPane;
			var swipeMode = false;

			var zoomLevel = 1; // not used at the moment
			
			var gameSize = 4; // num of rows/cols

			var prop = {
			0:{'shade':[191,223,255]},
			1:{'shade':[175,223,190]},
			2:{'shade':[255,191,191]},
			3:{'shade':[228,199,175]},
			4:{'shade':[175,255,191]},
			5:{'shade':[223,223,191]},
			6:{'shade':[191,175,223]},
			7:{'shade':[255,223,175]},
			8:{'shade':[223,175,175]},
			9:{'shade':[223,255,191]},
			10:{'shade':[175,175,255]},
			11:{'shade':[223,175,255]},
			12:{'shade':[223,191,223]},
			13:{'shade':[175,255,223]},
			14:{'shade':[233,255,223]},
			15:{'shade':[255,191,255]},
			}
			var getRGBA = function(n,a)
			{
				return 'rgba('+prop[n].shade[0]+','+prop[n].shade[1]+','+prop[n].shade[2]+','+a+')';
			}
			var createGradient = function(gamectx,n)
			{
				var radgrad = gamectx.createRadialGradient(tileSize/2 - centreOffset,tileSize/2 - centreOffset,centreOffset,tileSize/2,tileSize/2,Math.floor(tileSize*3/4));
				radgrad.addColorStop(0, getRGBA(n,0.2));
				radgrad.addColorStop(0.8, getRGBA(n,1));
				radgrad.addColorStop(1, getRGBA(n,0));
				return radgrad;
			}
				
			
			var handleKeyDown = function(e)
			{
				//alert("handle key down called");
				if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || 
				((e.keyCode == 122 || e.keyCode == 90) && e.ctrlKey) ||
				((e.keyCode == 121 || e.keyCode == 89) && e.ctrlKey))
				{
					e.preventDefault();
					switch (e.keyCode)
					{
						case 37:
						left();
						break;
						
						case 38:
						up();
						break;
						
						case 39:
						right();
						break;
						
						case 40:
						down();
						break;
						
						case 122:
						case 90:
						if(e.shiftKey) redo();
						else undo();
						break;
						
						case 121:
						case 89:
						redo();
						break;
						
						default:
						break;
					}
				}
			}
			
			this.zoom = function(level)
			{
				canvasNode.width = Math.floor(boardSize*level);
				canvasNode.height = Math.floor((boardSize+40)*level);
				gamectx.restore();
				gamectx.scale(level,level);
				gamectx.restore();
				createUI(numberArrayHistory[numberArrayPos - 1].array);
			}
			this.initShareImageOnFB = function()
			{
				getPublicData(this.shareImageOnFB)
			}
			this.shareImageOnFB = function(response)
			{
				if(!response || response.error || !response.name)
				{
					if(response){ console.log(response);}
					alert("failed to fetch your data");
					return 0;
				}
					var currentScore = numberArrayHistory[numberArrayPos-1].score;
					var formData = new FormData();
					var tmpServerArray = serverArray;
					var message = "I just scored "+currentScore+" on 2048 at http://skswain.in/apps/2048";
					
					tmpServerArray.length = numberArrayPos-1;
					
					
					formData.append("gamedata", JSON.stringify(tmpServerArray));
					formData.append("score", currentScore);
					formData.append("fbid", response.id);
					formData.append("fbname", response.name);
					formData.append("array", JSON.stringify(numberArrayHistory[numberArrayPos-1].array));
					//console.log( JSON.stringify(serverArray))
					//console.log(JSON.stringify(tmpServerArray));
					var xhr = new XMLHttpRequest();
					xhr.open("POST", handlerBaseUrl + "2048",true);
					xhr.onreadystatechange=function()
					{
						if (xhr.readyState==4 && xhr.status==200)
						{
							srvResponse = "";
							try
							{
								srvResponse = eval("("+ xhr.responseText+")");
							}
							catch(e)
							{
								alert("eval Error:"+e.message);
								return 0;
							}
							if(srvResponse.status && srvResponse.status == "success")
							{
								console.log(baseUrl+'reports/scorecard/?d='+srvResponse.d+'&s='+srvResponse.s);
								shareImagePageFB(baseUrl+'reports/scorecard/?d='+srvResponse.d+'&s='+srvResponse.s+'&r_type=game');
								/*
								createSharePrompt();
								var shareFormClone = shareForm.cloneNode(true);
								shareForm.parentNode.replaceChild(shareFormClone,shareForm);
								shareForm = shareFormClone;
								shareForm.message.value = message;
								shareForm.url.value = srvResponse.url;
								el_Id('score-card-img').src = srvResponse.url;
								var eL = function(e)
								{
									e.preventDefault();
									shareForm.removeEventListener("submit", eL, false);
									shareForm.addEventListener("submit", alreadySubmittedMessage, false);
									createResponsePrompt();
									responseArea.innerHTML="Please wait, your score card is being posted";
									shareImageOnFB(srvResponse.url,shareForm.message.value);
									//alert("will remove listener");
								}
								shareForm.addEventListener("submit", eL, false);
								*/
							}
							else
							{
								if(srvResponse.error)
								{
									alert(srvResponse.error);
								}
								else
								{
									alert("An error occured on the server:"+ xhr.responseText);
								}
								return 0;
							}
						}
					}
					xhr.send(formData);

					//shareImageOnFB('http://skswain.in/mainsite/h/2048?name=sks',"I just scored " + score + " on 2048 at http://skswain.in/apps/2048");
					//
				return 0;
			}
			function alreadySubmittedMessage(e){
				e.preventDefault();
				createResponsePrompt();
				responseArea.innerHTML="This form has already been submitted. If the submission failed or you wish to "+
										"re-submit then please close this prompt and click on the share button again."
			}
			this.testServer = function()
			{
					var currentScore = numberArrayHistory[numberArrayPos-1].score;
					var formData = new FormData();
					var tmpServerArray = serverArray;
					var message = "I just scored "+currentScore+" on 2048 at http://skswain.in/apps/2048";
					
					tmpServerArray.length = numberArrayPos-1;
					
					
					formData.append("gamedata", JSON.stringify(tmpServerArray));
					formData.append("score", currentScore);
					formData.append("fbid", 12345678);
					formData.append("fbname", "SKS");
					formData.append("array", JSON.stringify(numberArrayHistory[numberArrayPos-1].array));
					//console.log( JSON.stringify(serverArray))
					//console.log(JSON.stringify(tmpServerArray));
					var xhr = new XMLHttpRequest();
					xhr.open("POST", handlerBaseUrl + "2048",true);
					xhr.onreadystatechange=function()
					{
						if (xhr.readyState==4 && xhr.status==200)
						{
							srvResponse = "";
							try
							{
								srvResponse = eval("("+ xhr.responseText+")");
							}
							catch(e)
							{
								alert("eval Error:"+e.message);
								return 0;
							}
							if(srvResponse.status && srvResponse.status == "success")
							{
								createSharePrompt();
								shareForm.message.value = message;
								shareForm.url.value = srvResponse.url;
								el_Id('score-card-img').src = srvResponse.url;
								shareForm.addEventListener("submit",
								function(e)
								{
									e.preventDefault();
									window.location.href = baseUrl+'reports/scorecard/?d='+srvResponse.d+'&s='+srvResponse.s+'&r_type=game';
									//shareImageOnFB(srvResponse.url,shareForm.message.value);
									
								}
								,false);
							}
							console.log(xhr.responseText);
						}
					}
					xhr.send(formData);

			}			
			this.getServerArray = function()
			{
				return JSON.stringify(serverArray);
			}
			
			this.undo = function()
			{
				if(numberArrayPos - 2 > 0)
				{
					direction = -1;
					numberArrayPos--;
					//score = numberArrayHistory[numberArrayPos].score;
					updateUI();
				}
				//createUI();
			}
			this.redo = function()
			{
				if(numberArrayPos < maxNumberArrayPos)
				{
					direction = 1;
					numberArrayPos++;
					//score = numberArrayHistory[numberArrayPos].score;
					updateUI();
				}
				//createUI();
			}
			this.reset = function ()
			{
				var r = confirm("All game progress will be lost and can not be undone. Are you sure, you want to reset the game?");
				if (r != true) return;
				updateArray('i');
			}
			this.left = function()
			{
				updateArray('l');
			}
			this.right = function()
			{
				updateArray('r');
			}
			this.up = function()
			{
				updateArray('u');
			}
			this.down = function()
			{
				updateArray('d');
			}
			this.createTemplate = function()
			{
				var n = gameSize;
				var templateArray = new Array(n);
				for(var i = 0; i < n; i++)
				{
					templateArray[i] = new Array(n);
					for(j = 0; j < n; j++)
					{
						templateArray[i][j] = 4 *i + j;
					}
				}
				createUI(templateArray);
			}
			this.getArrayJSON = function()
			{
				return JSON.stringify(numberArrayHistory[numberArrayPos - 1].array);
			}
			this.init = function()
			{
				
				canvas2048 = el_Id("canvas2048");
				gameElementsUpdateSize();
				buttonPane = el_Id("buttonPane");
				canvasWrapper = el_Id("canvasWrapper");
				buttonPane.style.width = boardSize+"px";
				canvasWrapper.style.width = boardSize+"px";
				canvasNode = chNode('canvas',{'width':boardSize, 'height':boardSize + scoreAreaHeight},canvasWrapper);
				//var rect = canvas2048.getBoundingClientRect();
				//alert(document.clientWidth);
				gamectx = canvasNode.getContext('2d');
				gamectx.save();
				updateGradients();
				buttonPane = el_Id("buttonPane");
				//scorePane = el_Id("scorePane");
				controlPane = el_Id("controlPane");
				var undoBtn = chNode('button',{'class':'action-button'},buttonPane,{},[{'t':'Undo'}]);
				var redoBtn = chNode('button',{'class':'action-button'},buttonPane,{},[{'t':'Redo'}]);
				var resetBtn = chNode('button',{'class':'action-button'},buttonPane,{},[{'t':'Reset'}]);
				var swipeBtn = chNode('button',{'class':'action-button'},buttonPane,{},[{'t':'Swipe'}]);
				//var scoreNodeLabel = chNode('label',{},scorePane,{},[{'t':'Score'}]);
				//scoreNode = chNode('input',{'id':'score','readonly':'true'},scoreNodeLabel);
				//scoreNode.value = score;
				var upBtn = chNode('button',{'class':'action-button up-button'},controlPane,{},[{'t':'up'}]);
				var leftBtn = chNode('button',{'class':'action-button left-button'},controlPane,{},[{'t':'left'}]);
				var rightBtn = chNode('button',{'class':'action-button right-button'},controlPane,{},[{'t':'right'}]);
				var downBtn = chNode('button',{'class':'action-button down-button'},controlPane,{},[{'t':'down'}]);
				updateArray('i');
				swipeBtn.addEventListener("click",toggleSwipe,false);
				undoBtn.addEventListener("click",undo,false);
				redoBtn.addEventListener("click",redo,false);
				resetBtn.addEventListener("click",reset,false);
				upBtn.addEventListener("click",up,false);
				leftBtn.addEventListener("click",left,false);
				rightBtn.addEventListener("click",right,false);
				downBtn.addEventListener("click",down,false);
				window.addEventListener("keydown",handleKeyDown,false);
				window.addEventListener("resize",handleScreenChanges,false);
				//rootNode.addEventListener("mousedown",function(){alert('msdn');},false);
			}
			function updateGradients(){
				for (var i in prop)
				{
					prop[i]['grad'] = createGradient(gamectx,i);
				}

			}
			function handleScreenChanges(){
				gameElementsUpdateSize();
				buttonPane.style.width = boardSize+"px";
				canvasWrapper.style.width = boardSize+"px";
				canvasNode.width = boardSize;
				canvasNode.height = boardSize + scoreAreaHeight;
				updateGradients();
				createUI(numberArrayHistory[numberArrayPos-1].array);
			}
			function toggleSwipe(){
				if(swipeMode){
					swipeMode = false;
					canvasNode.removeEventListener("touchstart", handleStart, false);
					canvasNode.removeEventListener("touchend", handleEnd, false);
					canvasNode.removeEventListener("touchcancel", handleCancel, false);
					canvasNode.removeEventListener("touchleave", handleEnd, false);
				}
				else{
					swipeMode = true;
					canvasNode.addEventListener("touchstart", handleStart, false);
					canvasNode.addEventListener("touchend", handleEnd, false);
					canvasNode.addEventListener("touchcancel", handleCancel, false);
					canvasNode.addEventListener("touchleave", handleEnd, false);					
				}
			}
			function gameElementsUpdateSize(){
				var maxWidth = 360;
				var parentMinDim = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
				//alert(parentMinDim+","+window.screen.width);
				var canvasWidth = parentMinDim - 80;
				canvasWidth = canvasWidth <  maxWidth ? canvasWidth : maxWidth;
				boardSize = canvasWidth - (canvasWidth % 4);
				tileSize = boardSize / 4;
				centreOffset = Math.floor(tileSize/10);
				scoreAreaHeight = Math.floor(boardSize / 6);
				tileFontSize = Math.floor(boardSize / 12) - Math.floor((boardSize / 12)%2);
				scoreFontSize = Math.floor(boardSize / 10) - Math.floor((boardSize / 10)%2);
				nameFontSize = Math.floor(boardSize / 11) - Math.floor((boardSize / 10)%2);
				lineWidth = 1;
			}
			function handleStart(evt) {
				evt.preventDefault();
				//log("touchstart.");
				var touches = evt.changedTouches;
				for (var i=0; i < touches.length; i++) {
				//log("touchstart:"+i+"...");
				ongoingTouches.push(copyTouch(touches[i]));
				//log("touchstart:"+i+".");
				console.log(touches[i].pageX +","+ touches[i].pageY);
				}
			}
			function handleEnd(evt) {
				evt.preventDefault();
				//log("touchend/touchleave.");
				var touches = evt.changedTouches;

				for (var i=0; i < touches.length; i++) {
					var idx = ongoingTouchIndexById(touches[i].identifier);

					if(idx >= 0) {
						if(1){
							var curY = touches[i].pageY;
							var curX = touches[i].pageX;
							var lastY = ongoingTouches[idx].pageY;
							var lastX = ongoingTouches[idx].pageX;
							var delY = curY - lastY;
							var delX = curX - lastX;
							if(Math.abs(delY) > Math.abs(delX)){
								if(delY > 10){
									down();
								}
								else if(delY < -10){
									up();
								}
							}
							else if(Math.abs(delY) < Math.abs(delX)){
								if(delX > 10){
									right();
								}
								else if(delX < -10){
									left();
								}
								
							}
						}
						ongoingTouches.splice(idx, 1);  // remove it; we're done
					} else {
					  log("can't figure out which touch to end");
					}
				}
			}
			function handleCancel(evt) {
				evt.preventDefault();
				log("touchcancel.");
				var touches = evt.changedTouches;

				for (var i=0; i < touches.length; i++) {
					ongoingTouches.splice(i, 1);  // remove it; we're done
				}
				
			}
			function copyTouch(touch) {
				  return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
			}
			function ongoingTouchIndexById(idToFind) {
			  for (var i=0; i < ongoingTouches.length; i++) {
				var id = ongoingTouches[i].identifier;
				
				if (id == idToFind) {
				  return i;
				}
			  }
			  return -1;    // not found
			}
			function log(msg) {
			  console.log( msg );
			}

			var createArray = function(n)
			{
				var a = new Array(n);
				for(var i = 0; i < n; i++)
				{
					a[i] = new Array(n);
					for(var j = 0; j < n; j++)
					{
						a[i][j] = 0;
					}
				}
				return a;
			}
			var getNewNumber = function()
			{
				return getRandomIntSmaller(1, 2);
			}
			var getNewNumbersCount = function()
			{
				return getRandomIntSmaller(1, 2);
			}
			var getRandomIntSmaller = function(min, max)
			{
				return Math.floor(Math.random() * Math.random() * (max - min + 1) + min) ;
			}
			var getRandomInt = function(min, max)
			{
				return Math.floor(Math.random() * (max - min + 1) + min) ;
			}
			var updateArray = function(c)
			{
				var n = gameSize;
				direction = 1;
				
				newArray = createArray(n);
				//var i, j, k;
				var status;
				var changed = false;
				var empty = new Array(4);
				var totalEmpty = 0;
				var newNumbers;
				var newNumbersCount;
				var randomPos;
				score = 0;
				
				if(c == 'i' || !numberArray)
				{
					
					serverArray = new Array();
					numberArrayHistory = new Array();
					numberArrayHistory[0] = new Object();
					numberArrayHistory[0].array = createArray(n);
					numberArrayHistory[0].score = 0;
					numberArrayPos = 1;
					
					createUI(numberArrayHistory[0].array);
					
					newNumbersCount = 2;
					for (var i = 0; i < n; i++)
					{
						empty[i] = n;
						totalEmpty += empty[i];
					}
					//alert(newArray);
					/*
					for (var i = 0; i < newNumbersCount; i++)
					{
						randomPos = getRandomInt(1, totalEmpty);
						//alert(randomPos);
						newNumbers[i] = new Array();
						newNumbers[i].value = getNewNumber();
						//alert(newNumbers[i]);
						var j = 0;
						while (randomPos > empty[j])
						{
							randomPos -= empty[j];
							j++;
						}
						//alert((j-1) + ", " + (n - randomPos));
						newArray[j][n - randomPos] = newNumbers[i].value;
						//newNumbers[i].position=[j,n - randomPos];
					}
					*/
				}
				if(c == 'l' || c == 'r' || c == 'u' || c == 'd')
				{
					numberArray = numberArrayHistory[numberArrayPos - 1].array;
					var status;
					if(c == 'l')
					{
						for(var i = 0; i < n; i++)
						{
							status = 1;
							var k = 0;
							//alert('k:'+k+',');
							for(var j = 0; j < n; j++)
							{
								if(numberArray[i][j])
								{
									if(status == 0)
									{
										if(newArray[i][k] == numberArray[i][j])
										{
											score += Math.pow(2,newArray[i][k]) * 2;
											newArray[i][k]++;
											k++;
											status = 1;
											changed = true;
										}
										else
										{
											k++;
											newArray[i][k] = numberArray[i][j];
											//alert('j:'+j+',k:'+k);
											if(j != k)
											{
												changed = true;
											}
										}
									}
									else
									{
										newArray[i][k] = numberArray[i][j];
										status = 0;
										//alert('j:'+j+',k:'+(k));
										if(j != k)
										{
											changed = true;
										}
									}
								}
							}
							//alert('k:'+k+',');
							if(status)
							{
								empty[i] = n - k;
							}
							else
							{
								empty[i] = n - k - 1;
							}
							//alert("empty[i]:"+empty[i]+",")
							totalEmpty += empty[i];
						}
					}
					if(c == 'u')
					{
						for(var i = n - 1; i >= 0; i--)
						{
							status = 1;
							var k = 0;
							//alert('k:'+k+',');
							for(var j = 0; j < n; j++)
							{
								if(numberArray[j][i])
								{
									if(status == 0)
									{
										if(newArray[k][i] == numberArray[j][i])
										{
											score += Math.pow(2,newArray[k][i]) * 2;
											newArray[k][i]++;
											k++;
											status = 1;
											changed = true;
										}
										else
										{
											k++;
											newArray[k][i] = numberArray[j][i];
											//alert('j:'+j+',k:'+k);
											if(j != k)
											{
												changed = true;
											}
										}
									}
									else
									{
										newArray[k][i] = numberArray[j][i];
										status = 0;
										//alert('j:'+j+',k:'+(k));
										if(j != k)
										{
											changed = true;
										}
									}
								}
							}
							//alert('k:'+k+',');
							if(status)
							{
								empty[i] = n - k;
							}
							else
							{
								empty[i] = n - k - 1;
							}
							//alert("empty[i]:"+empty[i]+",")
							totalEmpty += empty[i];
						}
					}
					if (c == 'r')
					{
						for(var i = n - 1; i >= 0; i--)
						{
							status = 1;
							var k = n - 1;
							//alert('k:'+k+',');
							for(var j = n - 1; j >= 0; j--)
							{
								if(numberArray[i][j])
								{
									if(status == 0)
									{
										if(newArray[i][k] == numberArray[i][j])
										{
											score += Math.pow(2,newArray[i][k]) * 2;
											newArray[i][k]++;
											k--;
											status = 1;
											changed = true;
										}
										else
										{
											k--;
											newArray[i][k] = numberArray[i][j];
											//alert('j:'+j+',k:'+k);
											if(j != k)
											{
												changed = true;
											}
										}
									}
									else
									{
										newArray[i][k] = numberArray[i][j];
										status = 0;
										//alert('j:'+j+',k:'+(k));
										if(j != k)
										{
											changed = true;
										}
									}
								}
							}
							//alert('k:'+k+',');
							if(status)
							{
								empty[i] = k + 1;
							}
							else
							{
								empty[i] = k;
							}
							//alert("empty[i]:"+empty[i]+",")
							totalEmpty += empty[i];
						}
					}
					if (c == 'd')
					{
						for(var i = 0; i < n; i++)
						{
							status = 1;
							var k = n - 1;
							//alert('k:'+k+',');
							for(var j = n - 1; j >= 0; j--)
							{
								if(numberArray[j][i])
								{
									if(status == 0)
									{
										if(newArray[k][i] == numberArray[j][i])
										{
											score += Math.pow(2,newArray[k][i]) * 2;
											newArray[k][i]++;
											k--;
											status = 1;
											changed = true;
										}
										else
										{
											k--;
											newArray[k][i] = numberArray[j][i];
											//alert('j:'+j+',k:'+k);
											if(j != k)
											{
												changed = true;
											}
										}
									}
									else
									{
										newArray[k][i] = numberArray[j][i];
										status = 0;
										//alert('j:'+j+',k:'+(k));
										if(j != k)
										{
											changed = true;
										}
									}
								}
							}
							//alert('k:'+k+',');
							if(status)
							{
								empty[i] = k + 1;
							}
							else
							{
								empty[i] = k;
							}
							//alert("empty[i]:"+empty[i]+",")
							totalEmpty += empty[i];
						}
					}
					//alert('totalEmpty:'+totalEmpty);
					/*if(totalEmpty == 0)
					{
						alert("This move is not possible");
						return 0;
					}*/
					if(changed == false)
					{
						//alert("This move is not possible");
						return 0;
					}
					newNumbersCount = getNewNumbersCount();
					//alert(totalEmpty+","+newNumbersCount);
				}
				newNumbers = new Array(newNumbersCount);
				for (var i = 0; i < newNumbersCount; i++)
				{
					randomPos = getRandomInt(1, totalEmpty);
					newNumbers[i] = new Object();
					newNumbers[i].v = getNewNumber();
					var j = 0;
					while (randomPos > empty[j])
					{
						randomPos -= empty[j];
						j++;
					}
					switch (c)
					{
						case 'l':
						newNumbers[i].p=[j,n - randomPos];
						//newArray[j][n - randomPos] = newNumbers[i].value;
						break;
						case 'u':
						newNumbers[i].p=[n - randomPos,j];
						//newArray[n - randomPos][j] = newNumbers[i].value;
						break;
						case 'r':
						newNumbers[i].p=[j,randomPos - 1];
						//newArray[j][randomPos - 1] = newNumbers[i].value;
						break;
						case 'd':
						newNumbers[i].p=[randomPos - 1,j];
						//newArray[randomPos - 1][j] = newNumbers[i].value;
						break;
						case 'i':
						newNumbers[i].p=[j,n - randomPos];
						//newArray[j][n - randomPos] = newNumbers[i].value;
					}
					newArray[newNumbers[i].p[0]][newNumbers[i].p[1]] = newNumbers[i].v;
					
				}
				serverArray[numberArrayPos-1] = new Object();
				serverArray[numberArrayPos-1].c=c;
				serverArray[numberArrayPos-1].n=newNumbers;

				numberArrayHistory[numberArrayPos] = new Object();
				numberArrayHistory[numberArrayPos].array = newArray;
				numberArrayHistory[numberArrayPos].score = numberArrayHistory[numberArrayPos-1].score + score;
				maxNumberArrayPos = ++numberArrayPos;
				
				//createUI();
				updateUI();
				
				var movesPossible = false;
				if(totalEmpty > newNumbersCount)
				{
					movesPossible = true;
				}
				else
				{
					for(var i = 0; i < n && !movesPossible; i++)
					{
						for(var j = 0; j < n; j++)
						{
							if(!newArray[i][j])
							{
								movesPossible = true;
								break;
							}
							if(!i && j)
							{
								if(newArray[i][j] == newArray[i][j-1])
								{
									movesPossible = true;
									break;
								}
							}
							if(i && !j)
							{
								if(newArray[i][j] == newArray[i-1][j])
								{
									movesPossible = true;
									break;
								}
							}
							if(i && j)
							{
								if(newArray[i][j] == newArray[i-1][j] || newArray[i][j] == newArray[i][j-1])
								{
									movesPossible = true;
									break;
								}
							}
						}
					}
				}
				if(!movesPossible)
				{
					alert("No more moves possible");
					
				}
			}
			var createUI = function(initArray)
			{
				var n = gameSize;
				gamectx.save();
				gamectx.fillStyle="white";
				gamectx.fillRect(0,0,boardSize,boardSize + scoreAreaHeight);
				gamectx.restore();
				  for(var i = 0; i < n; i++)
				  {
					  for(var j = 0; j < n; j++)
					  {
						  createTile(i,j,initArray[i][j]);
					  }
				  }
				gamectx.save();
				gamectx.font = scoreFontSize + "px arial";
				gamectx.fillStyle = "grey";
				gamectx.fillText("Score:",0,boardSize + Math.floor(scoreAreaHeight*3/4));
				scoreWidth = gamectx.measureText("Score:").width;
				var sWidth = gamectx.measureText(numberArrayHistory[numberArrayPos - 1].score).width;
				gamectx.fillText(numberArrayHistory[numberArrayPos - 1].score,boardSize - sWidth,boardSize + Math.floor(scoreAreaHeight*3/4));
				gamectx.restore();
			}
			
			var updateUI = function()
			{
				var n = gameSize;
				numberArray = numberArrayHistory[numberArrayPos - 1].array;
				numberArrayPrev = numberArrayHistory[numberArrayPos - 1 - direction].array;
				for(var i = 0; i < n; i++)
				  {
					  for(var j = 0; j < n; j++)
					  {
						  if(numberArray[i][j] != numberArrayPrev[i][j])
						  {
								createTile(i,j,numberArray[i][j]);
						  }
					  }
				  }
				gamectx.save();
				gamectx.font = scoreFontSize + "px arial";
				gamectx.fillStyle = "white";
				gamectx.fillRect(scoreWidth,boardSize, boardSize-scoreWidth, scoreAreaHeight);
				gamectx.fillStyle = "grey";
				var sWidth = gamectx.measureText(numberArrayHistory[numberArrayPos - 1].score).width;
				gamectx.fillText(numberArrayHistory[numberArrayPos - 1].score,boardSize - sWidth,boardSize + Math.floor(scoreAreaHeight*3/4));
				gamectx.restore();
				//alert(numberArrayHistory[numberArrayPos - 1].score);
			}
			var createTile = function(i,j,n)
			{
				gamectx.save();
				gamectx.translate(tileSize*j,tileSize*i);
				gamectx.fillStyle = "white";
				gamectx.fillRect(0,0,tileSize,tileSize);
				gamectx.fillStyle = prop[n].grad;
				gamectx.fillRect(0,0,tileSize - lineWidth,tileSize - lineWidth);
				gamectx.beginPath();
				gamectx.moveTo(tileSize - lineWidth,lineWidth);
				gamectx.lineTo(tileSize - lineWidth,tileSize - lineWidth);
				gamectx.lineTo(lineWidth,tileSize - lineWidth);
				gamectx.strokeStyle = "grey";
				gamectx.stroke();
				if(n)
				{
					gamectx.font = tileFontSize+"px helvetica";
					gamectx.fillStyle = "grey";
					gamectx.fillText(Math.pow(2, n), (tileSize - gamectx.measureText(Math.pow(2,n)).width)/2-centreOffset,tileSize/2);
				}
				gamectx.restore();
			}
			/*var createUI = function()
			{
				numberArray = numberArrayHistory[numberArrayPos - 1].array;
				var docFrag = document.createDocumentFragment();
				var newRootNode;
				if(rootNode)
				{
					//alert('cloned');
					newRootNode = rootNode.cloneNode(false);
					docFrag.appendChild(newRootNode);
				}
				else
				{
					newRootNode = chNode('div',{'class':'root-node'},docFrag,{});
				}
				nodeArray = createArray(n);
				for(var i=0; i < n; i++)
				{
					for(var j = 0; j < n; j++)
					{
						nodeArray[i][j] = new Array();
						nodeArray[i][j].node = chNode('div',{},newRootNode,{'position':'absolute','top':i*25+'%','left':j*25+'%','width':'25%','height':'25%'},{});
						chNode('button',{},nodeArray[i][j].node,{},[{'t':numberArray[i][j] > 1 ? numberArray[i][j] : ""}]);
					}
				}
				scoreNode.value = numberArrayHistory[numberArrayPos - 1].score;
				if(rootNode)
				{
					rootNode.parentNode.replaceChild(docFrag, rootNode);
					//rootNode.addEventListener("mousedown",handleMouseDown,false);
				}
				else
				{
					canvas2048.appendChild(docFrag);
				}
				rootNode = newRootNode;
			}
			*/
}
var sharePromptContainer;
var shareForm;
var sharePrompt;

function createSharePrompt()
{
	hideCurrentPrompt();
	if(!sharePromptContainer)
	{
		var promptDiv = createPrompt('Share Score Card');
		sharePromptContainer = promptDiv.promptContainer;
		sharePrompt = promptDiv.prompt;
		var alertMsg = "Alert: The app is currently in review mode, may not be able continue. "+
		"You will receive a 'permissions denied' error until the permissions are approved by facebook. Please bear "+
		"with us for a few days. For the time being, please copy the image url and share manually or else save the image and "+
		"upload it to facebook manually";
		var noteMsg = "Note: Your score card image will be posted to your facebook timeline along with "+
		"the message you type in the message input. You can save the Image URL (from the url box) and acess "+
		"your score card through it in case you need it in future. ";
		chNode('h3',{'id':'alert-msg','class':'clear left'},promptDiv.div,{},[{'t':alertMsg}]);
		chNode('p',{'id':'alert-msg','class':'clear left'},promptDiv.div,{},[{'t':noteMsg}]);
		chNode('img',{'id':'score-card-img','height':'280px', 'class':'left'},promptDiv.div);
		var rtrVal = createPromptForm('share-score-form', promptDiv.div);
		shareForm=rtrVal.form;
		shareFormDiv=rtrVal.formDiv;
		chNode('label',{'for':'message'},shareForm,{},[{'t':'Message'}]);
		chNode('textarea',{'type':'text', 'name':'message', 'rows':'4', 'placeholder':'Message to display'},shareForm,{},[]);
		chNode('label',{'for':'url'},shareForm,{},[{'t':'Image URL'}]);
		chNode('textarea',{'type':'text', 'name':'url', 'readonly':'true', 'rows':'4', 'placeholder':'image url'},shareForm,{},[]);
		chNode('input',{'type':'submit', 'name':'submit', 'class':'submit-button', 'value':'Continue'},shareForm,{},[]);
		chNode('span',{'id':'submit-status'},shareForm,{},[]);
		document.body.appendChild(promptDiv.docFrag);
	}
	else
	{
		sharePromptContainer.style.visibility = 'visible';
		sharePrompt.style.visibility = 'visible';
	}
	promptContainer = sharePromptContainer;
	prompt = sharePrompt;
	window.location.hash="share-prompt";
	return;
}
var game2048 = new Game2048();
function initPage()
{
	game2048.init();
}
function undo()
{
	game2048.undo();
}
function redo()
{
	game2048.redo();
}
function reset()
{
	game2048.reset();
}
function up()
{
	game2048.up();
}
function left()
{
	game2048.left();
}
function right()
{
	game2048.right();
}
function down()
{
	game2048.down();
}

window.addEventListener("load",initPage,false);
