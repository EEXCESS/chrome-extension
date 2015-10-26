require(["up/profileManager"], function (p){

	var name = p.getName();
	console.log("Name: 		" + name + " (" + p.isNameDisclosed() + ")");
	p.setName(name + "New");
	console.log("Name: 		" + p.getName() + " (" + p.isNameDisclosed() + ")");
	p.setName(name);


	p.discloseCountry();
	var country = p.getCountry();
	console.log("Country: 	" + country + " (" + p.isCountryDisclosed() + ")");
	p.setCountry(country + "New");
	p.hideCountry();
	console.log("Country: 	" + p.getCountry() + " (" + p.isCountryDisclosed() + ")");
	p.setCountry(country);

	p.discloseCity();
	var city = p.getCity();
	console.log("City: 		" + city + " (" + p.isCityDisclosed() + ")");
	p.setCity(city + "New");
	p.hideCity();
	console.log("City: 		" + p.getCity() + " (" + p.isCityDisclosed() + ")");
	p.setCity(city);

	p.discloseAgeRange();
	var ageRange = p.getAgeRange();
	console.log("Age range:	" + ageRange + " (" + p.isAgeRangeDisclosed() + ")");
	p.setAgeRange(-1);
	p.hideAgeRange();
	console.log("Age range:	" + p.getAgeRange() + " (" + p.isAgeRangeDisclosed() + ")");
	p.setAgeRange(ageRange);

	// Languages
	p.discloseLanguage(0);
	var languages = p.getLanguages();
	console.log("Languages: ");
	for (var i = 0 ; i < languages.length ; i++){
		console.log("			- " + p.getLanguages()[i].languageLabel + " (" + p.isLanguageDisclosed(i) + ")");
	}
	p.hideLanguage(0);
	console.log("Languages: ");
	for (var i = 0 ; i < p.getLanguages().length ; i++){
		console.log("			- " + p.getLanguages()[i].languageLabel + " (" + p.isLanguageDisclosed(i) + ")");
	}
	p.setLanguages([]);
	console.log("Languages: ");
	for (var i = 0 ; i < p.getLanguages().length ; i++){
		console.log("			- " + p.getLanguages()[i].languageLabel + " (" + p.isLanguageDisclosed(i) + ")");
	}
	p.setLanguages(languages);

	// Interests
	p.discloseInterest(0);
	var interests = p.getInterests();
	console.log("Interests: ");
	for (var i = 0 ; i < interests.length ; i++){
		console.log("			- " + interests[i] + " (" + p.isInterestDisclosed(i) + ")");
	}
	p.hideInterest(0);
	console.log("Interests: ");
	for (var i = 0 ; i < p.getInterests().length ; i++){
		console.log("			- " + p.getInterests()[i] + " (" + p.isInterestDisclosed(i) + ")");
	}
	p.setInterests([]);
	console.log("Interests: ");
	for (var i = 0 ; i < p.getInterests().length ; i++){
		console.log("			- " + p.getInterests()[i] + " (" + p.isInterestDisclosed(i) + ")");
	}
	p.setInterests(interests);

	p.hideCity();
	p.hideCountry();
	console.log(p.isCountryDisclosed() + " & " + p.isCityDisclosed()); // f & f
	p.discloseCountry();
	console.log(p.isCountryDisclosed() + " & " + p.isCityDisclosed()); // t & f
	p.hideCountry();
	console.log(p.isCountryDisclosed() + " & " + p.isCityDisclosed()); // f & f
	p.discloseCity();
	console.log(p.isCountryDisclosed() + " & " + p.isCityDisclosed()); // t & t
	p.hideCity();
	console.log(p.isCountryDisclosed() + " & " + p.isCityDisclosed()); // t & f
});	