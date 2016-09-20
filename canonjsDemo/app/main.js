
define(
    [
          './gl-context.js'

        , 'webgl/gl-matrix-2.1.0' // in /lib
        , 'webgl/myShaders' // in /lib

        , 'fpsmeter' // in /lib

        , 'cannon.min' // in /lib

        , './geometries/geometryColor.js'

        , './simulation/simulation.js'
    ],
    function(
          gl

        , glm
        , myShaders

        , unused_fpsmeter // <- use window.FPSMeter

        , unused_CANNON // <- use CANNON

        , createGeometryColor

        , createSimulation
    )
{




    var createShaders = myShaders.createShaders

    //
    //
    // shader

    var shader_opt = {
        vs_id: "shader-vs-color",
        fs_id: "shader-fs-color",
        arr_attrib: ['aVertexPosition','aVertexColor'],
        arr_uniform: ['uMVMatrix','uPMatrix','uColorApha']
    }
    g_shaderProgram_color = new createShaders( gl, shader_opt );

    //

    var shader_color = g_shaderProgram_color;

    // shader
    //
    //

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);





    //
    // create axis geometry

    var vertices = [];

    var axis_size = 20;

    vertices.push(0,0,0,  1,0,0,  axis_size,0,0,  1,0,0)
    vertices.push(0,0,0,  0,1,0,  0,axis_size,0,  0,1,0)
    vertices.push(0,0,0,  0,0,1,  0,0,axis_size,  0,0,1)

    var geom_axis = new createGeometryColor(vertices, gl.LINES);

    // create axis geometry
    //




    var aspectRatio = gl.viewportWidth / gl.viewportHeight;




    //
    // FPS METER

    var myFpsmeter_elem = document.getElementById('canvasesdiv');
    var myFpsmeter = new window.FPSMeter(
        myFpsmeter_elem,
        window.FPSMeter.theme.transparent
    );

    // FPS METER
    //




    var simulation = new createSimulation();


    var center = {x:0, y:0, z:0};

    tick();

    function tick(time) {

        // plan the next frame
        window.requestAnimFrame( tick ); // webgl-utils.js



        myFpsmeter.tickStart();




        simulation.update(time);



        //
        //
        ////// camera

        var pos = {x:0, y:0, z:0};
        var car_index = -1;
        var curr_checkpoint = -1;

        for (var i = 0; i < simulation._cars.length; ++i)
        {
            var car = simulation._cars[i];

            if (!car._alive)
                continue;

            if (curr_checkpoint > car._current_checkpoint_id)
                continue;

            car_index = i;
            curr_checkpoint = car._current_checkpoint_id;
            pos = car._chassisBody.position;
            // break;
        }

        var diff = {
              x: pos.x - center.x
            , y: pos.y - center.y
            , z: pos.z - center.z
        }

        center.x = center.x + diff.x * 0.1;
        center.y = center.y + diff.y * 0.1;
        center.z = center.z + diff.z * 0.1;

        ////// camera
        //
        //


        //
        //
        ////// matrices

        // set the projection matrix

        var tmp_pMatrix = glm.mat4.create();
        glm.mat4.perspective(tmp_pMatrix, 70, aspectRatio, 0.1, 700);

        // set the modelview matrix

        var tmp_viewMatrix = glm.mat4.create();

        // glm.mat4.lookAt( tmp_viewMatrix, [pos.x+30, pos.y+30, pos.z+30], [pos.x, pos.y, pos.z], [0,0,1] );
        glm.mat4.lookAt( tmp_viewMatrix, [center.x+30, center.y+30, center.z+30], [center.x, center.y, center.z], [0,0,1] );


        ////// /matrices
        //
        //





        //
        //
        ////// render 3d scene

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        /// render scene

        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(shader_color);

            gl.uniformMatrix4fv(shader_color.uPMatrix, false, tmp_pMatrix);
            gl.uniformMatrix4fv(shader_color.uMVMatrix, false, tmp_viewMatrix);
            gl.uniform1f(shader_color.uColorApha, 1.0);

            geom_axis.render(shader_color);

            simulation.render(shader_color, tmp_viewMatrix, car_index);

        gl.useProgram(null);

        ////// /render 3d scene
        //
        //







        myFpsmeter.tick();


    } // function tick(in_event)

});