precision highp float;

uniform sampler2D u_texture;
uniform sampler2D u_mask;
uniform vec2 u_resolution;
uniform vec3 u_maskColor;
uniform vec2 u_shift;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  vec4 textureColor = texture2D(u_texture, uv + u_shift);
  vec4 maskColor = texture2D(u_mask, uv);
  float revMaskValue = abs(maskColor.r - u_maskColor.r) + abs(maskColor.g - u_maskColor.g) + abs(maskColor.b - u_maskColor.b);
  float maskValue = 1.0 - clamp(revMaskValue, 0.0, 1.0);
  gl_FragColor = textureColor * maskValue;
}
