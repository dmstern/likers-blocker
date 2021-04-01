export default class TextStyle {
	color: string;
	fontFamily: string;
	fontStyle: string;
	fontWeight: string;

	constructor(cssStyle: CSSStyleDeclaration) {
		this.color = cssStyle.color;
		this.fontFamily = cssStyle.fontFamily;
		this.fontStyle = cssStyle.fontStyle;
		this.fontWeight = cssStyle.fontWeight;
	}
}
