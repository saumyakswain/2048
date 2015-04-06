function initMain()
{
	mainContainer = el_Id("main-content");

}
function newEl(elem){
	var el = document.createElement(elem);
	return el;
	}	
function tNode(text,parent){
	var tn = document.createTextNode(text);
	parent.appendChild(tn);
	return tn;
	}
function addAttr(attr,el){
	for(var x in attr){
		el.setAttribute(x,attr[x]);
		}
	}
function addStyl(styl,el){
	for(var y in styl){
		el.style[y]= styl[y];
		}
	}
function chNode(elem,attribs,parent,styles,text){
	var el = newEl(elem);
	addAttr(attribs,el);
	addStyl(styles,el);
	if(parent){parent.appendChild(el);}
	if(text){
		for(var z in text){
		if(text[z].t){tNode(text[z].t,el);}
		else if(text[z].h){el.innerHTML+=text[z].h;}
			}
		}
	return el;
}
function xhRqst(rqType,url,params,object,func,rtrnTyp,rtrnPars,sync){
				var xhr = new XMLHttpRequest;
				if(rqType == "GET") url = url+params;
				xhr.open(rqType,url,!sync);
				if(rqType == "GET") xhr.send(null);
				else if(rqType == "POST"){
					xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
					xhr.send(params);
				}
				if(sync){
					if(rtrnTyp == 't'){var rtrnVal = xhr.responseText;}
						else if(rtrnTyp == 'x'){var rtrnVal = xhr.responseXML;}
						object[func](rtrnVal,rtrnPars);
				}else{
					xhr.onreadystatechange = function (){
						if(xhr.readyState == 4 && xhr.status == 200){
							if(rtrnTyp == 't'){var rtrnVal = xhr.responseText;}
							else if(rtrnTyp == 'x'){var rtrnVal = xhr.responseXML;}
							object[func](rtrnVal,rtrnPars);
						}
					}
				}
				return xhr;
			}
function el_Id(id){
	return document.getElementById(id);
	}
function el_Tag(tag){
	return document.getElementByTagName(tag);
	}
function clearChildren(myNode){
		var fc = myNode.firstChild;
		while( fc ) {
			myNode.removeChild( fc );
			fc = myNode.firstChild;
		}
	}

