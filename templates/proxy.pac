function FindProxyForURL(url, host) {
	if (shExpMatch(host, "*.nianticlabs.com")) {
		return "PROXY ##PROXY##";
	}
 
    return DIRECT; 
}