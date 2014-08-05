var Background;
(function (Background) {
    var LightPosition = (function () {
        function LightPosition(id, x, y, speed) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.speed = speed;
        }
        return LightPosition;
    })();

    var LightAttenuationAnimator = (function () {
        function LightAttenuationAnimator(startValue, minValue, maxValue, speed) {
            this.startValue = startValue;
            this.minValue = minValue;
            this.maxValue = maxValue;
            this.speed = speed;
            this.sign = 1;
            this.currentValue = startValue;
        }
        LightAttenuationAnimator.prototype.animate = function (deltaT) {
            this.currentValue += this.sign * ((deltaT / 1000) * this.speed);

            if (this.currentValue >= this.maxValue) {
                this.sign *= -1;
            } else if (this.currentValue <= this.minValue) {
                this.sign *= -1;
            }

            return this.currentValue;
        };
        return LightAttenuationAnimator;
    })();

    var Renderer = (function () {
        function Renderer(canvas) {
            var _this = this;
            this.canvas = canvas;
            this.maxLights = 10;
            this.lightPositionsArray = new Float32Array(this.maxLights * 2);
            this.lightColorsArray = new Float32Array(this.maxLights * 4);
            this.lightPos = {};
            Base.PageModel.currentPageModel().lights.subscribe(function (lights) {
                _this.createLightData(lights);
            });
        }
        Renderer.prototype.render = function () {
            var _this = this;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.gl = this.setupWebGL();

            var currentTime = 0;

            var currentSize = 9;
            var sizeSign = 1;

            var attenuationExponentAnimator = new LightAttenuationAnimator(9, 7, 20, 2);
            var attenuationLinearAnimator = new LightAttenuationAnimator(0.1, 0.05, 0.15, 0.05);
            var attenuationConstantAnimator = new LightAttenuationAnimator(0.6, 0.5, 0.9, 0.05);

            var renderFrame = function (now) {
                var deltaT = now - currentTime;

                _this.gl.uniform2fv(_this.gl.getUniformLocation(_this.program, "lightPositions"), _this.lightPositionsArray);
                _this.gl.uniform4fv(_this.gl.getUniformLocation(_this.program, "lightColors"), _this.lightColorsArray);
                _this.gl.uniform1f(_this.gl.getUniformLocation(_this.program, "exponentFactor"), attenuationExponentAnimator.animate(deltaT));
                _this.gl.uniform1f(_this.gl.getUniformLocation(_this.program, "linearFactor"), attenuationLinearAnimator.animate(deltaT));
                _this.gl.uniform1f(_this.gl.getUniformLocation(_this.program, "constantFactor"), attenuationConstantAnimator.animate(deltaT));

                _this.gl.clearColor(0, 0, 0, 1);
                _this.gl.clear(_this.gl.COLOR_BUFFER_BIT);

                _this.gl.drawArrays(_this.gl.TRIANGLES, 0, 6);

                currentTime = now;

                window.requestAnimationFrame(renderFrame);
            };

            window.requestAnimationFrame(renderFrame);
        };

        Renderer.prototype.createLightData = function (lights) {
            lights = Enumerable.from(lights).where(function (l) {
                return l.id != "all";
            }).toArray();

            for (var i = 0, pos_i = 0, color_i = 0; i < lights.length; i++, pos_i += 2, color_i += 4) {
                var light = lights[i];

                var rgbColor = Base.Helpers.hexToRgb(light.state.hex());

                var map = this.lightPos;

                if (!map[light.id]) {
                    map[light.id] = new LightPosition(light.id, Math.random(), Math.random(), Math.random());
                }

                var pos = map[light.id];

                this.lightPositionsArray[pos_i] = pos.x;
                this.lightPositionsArray[pos_i + 1] = pos.y;

                var colors = this.lightColorsArray;

                colors[color_i] = rgbColor.r / 255.0;
                colors[color_i + 1] = rgbColor.g / 255.0;
                colors[color_i + 2] = rgbColor.b / 255.0;
                colors[color_i + 3] = 1.0;
            }
        };

        Renderer.prototype.setupWebGL = function () {
            var gl = this.canvas.getContext("experimental-webgl");

            var vertexShader = this.getShader(gl, '2d-vertex-shader');
            var pixelShader = this.getShader(gl, '2d-fragment-shader');

            this.program = this.loadProgram(gl, vertexShader, pixelShader);

            gl.useProgram(this.program);

            // look up where the vertex data needs to go.
            var positionLocation = gl.getAttribLocation(this.program, "a_position");
            var texCoordLocation = gl.getAttribLocation(this.program, "a_texCoord");

            // provide texture coordinates for the rectangle.
            var texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 1.0]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            // lookup uniforms
            var resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");

            // set the resolution
            gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

            // Create a buffer for the position of the rectangle corners.
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            // Set a rectangle the same size as the image.
            this.setRectangle(gl, 0, 0, this.canvas.width, this.canvas.height);

            return gl;
        };

        Renderer.prototype.setRectangle = function (gl, x, y, width, height) {
            var x1 = x;
            var x2 = x + width;
            var y1 = y;
            var y2 = y + height;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]), gl.STATIC_DRAW);
        };

        Renderer.prototype.getShader = function (gl, id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {
                return null;
            }

            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3)
                    str += k.textContent;
                k = k.nextSibling;
            }

            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
                return null;
            }

            gl.shaderSource(shader, str);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        };

        Renderer.prototype.loadProgram = function (gl, vertexshader, fragmentshader) {
            var program = gl.createProgram();
            gl.attachShader(program, vertexshader);
            gl.attachShader(program, fragmentshader);

            gl.linkProgram(program);

            // Check the link status
            var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

            if (!linked) {
                // something went wrong with the link
                var lastError = gl.getProgramInfoLog(program);

                console.log(lastError);

                gl.deleteProgram(program);

                return;
            }
            return program;
        };
        return Renderer;
    })();
    Background.Renderer = Renderer;
})(Background || (Background = {}));
//# sourceMappingURL=background.js.map
