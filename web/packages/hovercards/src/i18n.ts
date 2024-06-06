export default function __( i18n: Record< string, string >, key: string ) {
	return i18n[ key ] || key;
}
