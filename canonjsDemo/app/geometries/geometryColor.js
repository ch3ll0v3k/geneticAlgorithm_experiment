
'use strict'

define(
	[

		  '../gl-context.js'

	],function(

		  gl
	)
{

	//

	var createGeometryColor = function (vertices, primitive, is_dynamic) {

		this._primitive = primitive;

		this._vbuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbuffer);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), is_dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
		// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		this._vbuffer.numItems = vertices.length / 6;



		//
		// tmp

		if (gl.getExtension) {
			this._ext = (
				gl.getExtension('OES_vertex_array_object') ||
				gl.getExtension('MOZ_OES_vertex_array_object') ||
				gl.getExtension('WEBKIT_OES_vertex_array_object')
			);
		}

		// /tmp
		//
	}

	//

	createGeometryColor.prototype.update = function(vertices) {

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbuffer);

		// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		this._vbuffer.numItems = vertices.length / 6;
	}

	//

	createGeometryColor.prototype.dispose = function() {

		gl.deleteBuffer(this._vbuffer);

		if (this._vao)
			this._ext.deleteVertexArrayOES( this._vao );

		// console.log('dispose called');
	}

	//

	createGeometryColor.prototype.render = function(shader) {

		if (this._ext)
		{
			if (this._vao)
			{
				this._ext.bindVertexArrayOES( this._vao );

					gl.drawArrays( this._primitive, 0, this._vbuffer.numItems );

				this._ext.bindVertexArrayOES( null );
			}
			else
			{
				this._vao = this._ext.createVertexArrayOES();

				this._ext.bindVertexArrayOES( this._vao );

					this.render_backup(shader, true);

				this._ext.bindVertexArrayOES( null );
			}
		}
		else
		{
			this.render_backup(shader);
		}
	};

	//

	createGeometryColor.prototype.render_backup = function(shader, no_clear) {

		gl.enableVertexAttribArray(shader.aVertexPosition);
		gl.enableVertexAttribArray(shader.aVertexColor);

			var bpp = 4; // gl.FLOAT -> 4 bytes
			var stride = 6 * bpp;
			var index_pos    = 0 * bpp;
			var index_color  = 3 * bpp;

			gl.bindBuffer(gl.ARRAY_BUFFER, this._vbuffer);
			gl.vertexAttribPointer(shader.aVertexPosition,3,gl.FLOAT,false,stride,index_pos);
			gl.vertexAttribPointer(shader.aVertexColor,3,gl.FLOAT,false,stride,index_color);

			gl.drawArrays( this._primitive, 0, this._vbuffer.numItems );

		if (!no_clear)
		{
			gl.disableVertexAttribArray(shader.aVertexPosition);
			gl.disableVertexAttribArray(shader.aVertexColor);
		}
	};


	//

	return createGeometryColor;
})
