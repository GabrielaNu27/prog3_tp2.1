class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies =[];
    }

    async getCurrencies() {
        try{
            const response = await fetch('https://api.frankfurter.app/currencies');
            const data = await response.json();
            const currencyCodes = Object.keys(data);
            this.currencies = currencyCodes.map(code =>
                new Currency(code, data[code]) );
        
        }catch(error){
            console.error('Error', error);
        }            
    }


    async convertCurrency(amount, fromCurrency, toCurrency) {
        try{
            if(fromCurrency.code == toCurrency.code){
                return parseFloat (amount);
            }
        
            const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);
            const data = await response.json();
            if(data.error){
                throw new Error(data.error);
            }
            return parseFloat(data.rates[toCurrency.code]) * parseFloat(amount);  
            
        }catch(error){
            console.error('Error', error);
            return null;
        }
       
    }
}




document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
