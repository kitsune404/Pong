#version 300 es
precision mediump float;
in vec2 fTexCoord;
out vec4 fragColor;
uniform sampler2D textureSampler;
void main() {
    fragColor = texture(textureSampler,fTexCoord);
}
