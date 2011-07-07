// Copyright 2010 Jussi Kalliokoski. Licensed under MIT License.

(function($){
	var swipeObjs = [];

	function startSwipe(swipeObj)
	{
		var swipe = {};
		$.extend(swipe, swipeObj);	
		swipe.swipeObj = swipeObj;
		swipeObj.motions.push(swipe);
		swipe.kill = function()
		{
			clearTimeout(this.timer);
			if (this.onEnd)
				this.onEnd(this.passData);
			for (var i=0; i<swipeObj.motions.length; i++)
				if (swipeObj.motions[i] == this)
					swipeObj.motions.splice(i--, 1);
		}
		return swipe;
	}

	function bind(elem, type, pass, func) // jQuery messes up with the touches.
	{try{ // We don't want to break stuff just because touch events aren't supported
		var fnc = function(e)
		{
			e.data = pass;
			func(e);
		}
		elem.addEventListener(type, fnc, false);
		if (!elem._binds)
			elem._binds = [];
		elem._binds.push({type: type, func: func, fnc: fnc});
	}catch(e){}}

	function unbind(elem, type, func)
	{try{
		if (elem._binds)
		for (var i=0; i<elem._binds.length; i++)
			if (elem._binds[i].type == type && elem._binds[i].func == func)
				elem.removeEventListener(type, elem._binds[i].fnc, false);
			
	}catch(e){}}

	$.fn.unswipe = function()
	{
		$(this).unbind('mousedown', swipeDown);
		$(this).unbind('mousedown', swipeCircularDown);
		for (var i=0; i<swipeObjs.length; i++)
			if (swipeObjs[i].area == this)
			{
				swipeObjs[i].kill();
				swipeObjs.splice(i--, 1);
			}
		unbind(this, 'touchstart', swipeTDown);
	}

	$.fn.swipe = function(arg1, arg2, arg3)
	{
		return $(this).each(function(){
			var swipeObj =
			{
				onMotion: function(){},
				onSwipe: null,
				onEnd: null,
				passData: null,
				affects: this,
				friction: 1.1,
				interval: 50,
				multiple: false
			};
			if (typeof arg1 == 'object')
				$.extend(swipeObj, arg1);
			else if (typeof arg1 == 'function')
			{
				swipeObj.onMotion = arg1;
				if (typeof arg2 == 'object')
					$.extend(swipeObj, arg2);
				else if(typeof arg2 == 'function')
				{
					swipeObj.onSwipe = arg2;
					if (typeof arg3 == 'object')
						$.extend(swipeObj, arg3);
					else if (typeof arg3 == 'function')
					{
						swipeObj.onEnd = arg3;
						if (typeof arg4 == 'object')
							$.extend(swipeObj, arg4);
					}
				}
			}
			else
				throw 'Invalid arguments.';
			if (swipeObj.friction <= 1)
				throw 'Invalid arguments: Friction must be over 1.';
			$.extend(swipeObj,
			{
				previousAngle: null,
				previousX: null,
				previousY: null,
				motionX: 0,
				motionY: 0,
				area: this,
				released: true,
				timer: null,
				motions: [],
				kill: function()
				{
					for (var i=0; i<this.motions.length; i++)
						this.motions[i].kill();
				}
			});
			swipeObjs.push(swipeObj);
			$(this).bind('mousedown', swipeObj, swipeDown);
			bind(this, 'touchstart', swipeObj, swipeTDown);
		});
	};

	function swipeTDown(e)
	{
		e.preventDefault();
		for (var i=0; i<e.touches.length; i++)
		{
			e.touches[i].data = e.data;
			swipeDown(e.touches[i]);
		}
	}

	function swipeTMove(e)
	{
		e.preventDefault();
		for (var i=0; i<e.touches.length; i++)
		{
			e.touches[i].data = e.data;
			swipeMove(e.touches[i]);
		}
	}

	function swipeTUp(e)
	{
		e.preventDefault();
		for (var i=0; i<e.touches.length; i++)
		{
			e.touches[i].data = e.data;
			swipeUp(e.touches[i]);
		}
	}

	function swipeDown(e)
	{
		if (e.data.onSwipe && !e.data.onSwipe.apply(e.data.area, [e, e.data.passData]))
			return;
		if (!e.data.multiple && e.data.motions.length)
			e.data.motions[0].kill();
		if (e.preventDefault)
			e.preventDefault();
		var swipe = startSwipe(e.data);
		swipe.previousX = e.pageX;
		swipe.previousY = e.pageY;
		swipe.motionX = 0;
		swipe.motionY = 0;
		swipe.released = false;
		$(swipe.affects).bind('mousemove', swipe, swipeMove);
		$(swipe.affects).bind('mouseup', swipe, swipeUp);
		bind(swipe.affects, 'touchmove', swipe, swipeTMove);
		bind(swipe.affects, 'touchend', swipe, swipeTUp);
		swipe.timer = setInterval(function()
		{
			if (swipe.motionX == 0 && swipe.motionY == 0 && swipe.released)
				return swipe.kill();
			swipe.onMotion.apply(swipe.area, [swipe.motionX, swipe.motionY, swipe.passData]);
			swipe.motionX /= swipe.friction;
			swipe.motionY /= swipe.friction;
			if (swipe.motionX < 0.1 && swipe.motionX > -0.1)
				swipe.motionX = 0;
			if (swipe.motionY < 0.1 && swipe.motionY > -0.1)
				swipe.motionY = 0;
		}, swipe.interval);
	}
	function swipeMove(e)
	{
		if (e.preventDefault)
			e.preventDefault();
		e.data.motionX += (e.pageX - e.data.previousX)/10;
		e.data.motionY += (e.pageY - e.data.previousY)/10;
		e.data.previousX = e.pageX;
		e.data.previousY = e.pageY;
	}
	function swipeUp(e)
	{
		if (e.preventDefault)
			e.preventDefault();
		$(e.data.affects).unbind('mousemove', swipeMove);
		$(e.data.affects).unbind('mouseup', swipeUp);
		unbind(e.data.affects, 'touchmove', swipeTMove);
		unbind(e.data.affects, 'touchup', swipeTUp);
		e.data.previousX = null;
		e.data.previousY = null;
		e.data.released = true;
	}




	$.fn.angularSwipe = function(arg1, arg2, arg3)
	{
		return $(this).each(function(){
			var swipeObj =
			{
				onMotion: function(){},
				onSwipe: null,
				onEnd: null,
				passData: null,
				affects: this,
				friction: 1.1,
				centerX: null,
				centerY: null,
				interval: 50,
				multiple: false
			};
			if (typeof arg1 == 'object')
				$.extend(swipeObj, arg1);
			else if (typeof arg1 == 'function')
			{
				swipeObj.onMotion = arg1;
				if (typeof arg2 == 'object')
					$.extend(swipeObj, arg2);
				else if(typeof arg2 == 'function')
				{
					swipeObj.onSwipe = arg2;
					if (typeof arg3 == 'object')
						$.extend(swipeObj, arg3);
					else if (typeof arg3 == 'function')
					{
						swipeObj.onEnd = arg3;
						if (typeof arg4 == 'object')
							$.extend(swipeObj, arg4);
					}
				}
			}
			else
				throw 'Invalid arguments.';
			if (swipeObj.friction <= 1)
				throw 'Invalid arguments: Friction must be over 1.';
			$.extend(swipeObj,
			{
				previousAngle: null,
				circulateX: null,
				circulateY: null,
				motion: 0,
				area: this,
				released: false,
				timer: null,
				motions: [],
				kill: function()
				{
					for (var i=0; i<this.motions.length; i++)
						this.motions[i].kill();
				}
			});
			swipeObjs.push(swipeObj);
			$(this).bind('mousedown', swipeObj, swipeCircularDown);
			bind(this, 'touchstart', swipeObj, swipeTDown);
		});
	};

	function swipeCircularTDown(e)
	{
		e.preventDefault();
		for (var i=0; i<e.touches.length; i++)
		{
			e.touches[i].data = e.data;
			swipeCircularDown(e.touches[i]);
		}
	}

	function swipeCircularTMove(e)
	{
		e.preventDefault();
		for (var i=0; i<e.touches.length; i++)
		{
			e.touches[i].data = e.data;
			swipeCircularMove(e.touches[i]);
		}
	}

	function swipeCircularTUp(e)
	{
		e.preventDefault();
		for (var i=0; i<e.touches.length; i++)
		{
			e.touches[i].data = e.data;
			swipeCircularUp(e.touches[i]);
		}
	}

	function swipeCircularDown(e)
	{
		if (e.data.onSwipe && !e.data.onSwipe.apply(e.data.area, [e, e.data.passData]))
			return;
		if (!e.data.multiple && e.data.motions.length)
			e.data.motions[0].kill();
		if (e.preventDefault)
			e.preventDefault();
		var swipe = startSwipe(e.data);
		if (!swipe.centerX || !swipe.centerY)
		{
			swipe.circulateX = e.pageX;
			swipe.circulateY = e.pageY;
		}
		else
		{
			swipe.circulateX = swipe.centerX;
			swipe.circulateY = swipe.centerY;
		}
		var newAngle = Math.atan2(e.pageY - swipe.circulateY, e.pageX - swipe.circulateX);
		swipe.previousAngle = newAngle;
		swipe.motion = 0;
		$(swipe.affects).bind('mousemove', swipe, swipeCircularMove);
		$(swipe.affects).bind('mouseup', swipe, swipeCircularUp);
		bind(swipe.affects, 'touchmove', swipe, swipeCircularTMove);
		bind(swipe.affects, 'touchend', swipe, swipeCircularTUp);
		swipe.released = false;
		swipe.timer = setInterval(function(){
			if (swipe.motion == 0 && swipe.released)
				return swipe.kill();
			swipe.onMotion.apply(swipe.area, [swipe.motion, swipe.passData]);
			swipe.motion /= swipe.friction;
			if (swipe.motion < 0.01 && swipe.motion > -0.01)
				swipe.motion = 0;
		}, swipe.interval);
	}
	function swipeCircularMove(e)
	{
		if (e.preventDefault)
			e.preventDefault();
		var newAngle = Math.atan2(e.pageY - e.data.circulateY, e.pageX - e.data.circulateX),
		angleDiff = newAngle - e.data.previousAngle;
		if (angleDiff > Math.PI)
			angleDiff = Math.PI  * 2 - angleDiff;
		else if (angleDiff < -Math.PI)
			angleDiff += Math.PI * 2;
		e.data.motion += angleDiff;
		e.data.previousAngle = newAngle;
	}
	function swipeCircularUp(e)
	{
		if (e.preventDefault)
			e.preventDefault();
		$(e.data.affects).unbind('mousemove', swipeCircularMove);
		$(e.data.affects).unbind('mouseup', swipeCircularUp);
		e.data.circulateX = null;
		e.data.circulateY = null;
		e.previousAngle = null;
		e.data.released = true;
		unbind(e.data.affects, 'touchmove', swipeCircularTMove);
		unbind(e.data.affects, 'touchup', swipeCircularTUp);
	}
})(jQuery);
