class FiscalCodeValidator {
    //calcolo della data con tabella dei mesi
    table_month = ['A','B','C','D','E','H','L','M','P','R','S','T']

    //Tabella per le lettere in posizione dispari
    controlTableOdd={
        0:1,  1:0,  2:5,  3:7,  4:9,  5:13, 6:15, 7:17, 8:19,
        9:21, A:1,  B:0,  C:5,  D:7,  E:9,  F:13, G:15, H:17,
        I:19, J:21, K:2,  L:4,  M:18, N:20, O:11, P:3,  Q:6,
        R:8,  S:12, T:14, U:16, V:10, W:22, X:25, Y:24, Z:23
    }

    controlTable="ABCDEFGHIJKLMNOPQRSTUVWXYZ"


    //Tabella per le lettere in posizione pari
    controlTableEven={
        0:0,  1:1,   2:2,  3:3,   4:4,  5:5,  6:6,  7:7,  8:8,
        9:9,  A:0,   B:1,  C:2,   D:3,  E:4,  F:5,  G:6,  H:7,
        I:8,  J:9,   K:10, L:11,  M:12, N:13, O:14, P:15, Q:16,
        R:17, S:18,  T:19, U:20,  V:21, W:22, X:23, Y:24, Z:25
    }

    //Tabella omocodia
     controlTableHomocody = [
        'L', 'M', 'N', 'P', 'Q',
        'R', 'S', 'T', 'U', 'V'
    ]

    //Posizioni possibili per sostituzione
    positionOmocodia = [6,7,9,10,12,13,14]

    //Raccoglie le consonanti
    consonanti(str){
        return str.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/gi,'')
    }

    //Raccoglie le vocali
    vocali(str){
        return str.replace(/[^AEIOU]/gi,'')
    }
    //Genera il codice per il cognome
    code_surname(surname)
    {
        var surname     = this.consonanti(surname)
        surname         += this.vocali(surname)
        surname         +='XXX'
        surname         = surname.substr(0,3)
        return surname.toUpperCase()
    }
    //Genera il codice per il nome
    code_name(input_name)
    {
        var name = this.consonanti(input_name)
        if(name.length >= 4){
            name=
                name.charAt(0)+
                name.charAt(2)+
                name.charAt(3)
        }else{
            name += this.vocali(input_name)
            name +='XXX'
            name = name.substr(0,3)
        }
        return name.toUpperCase()
    }
    //Data di nascita
    code_date(gg , mm, aa, gender)
    {
        var d     = new Date()
        d.setYear(aa);
        d.setMonth(mm - 1);
        d.setDate(gg);
        var year  = "0" + d.getFullYear()
        year      = year.substr(year.length - 2,2);
        var month = this.table_month[d.getMonth()]
        var day   = d.getDate()
        if(gender == 'Female') day+=40;
        day       = "0" + day
        day       = day.substr(day.length-2,2);
        return "" + year + month + day
    }
    //Calcola carattere finale(carattere di controllo per un codice fiscale valido)
    calcola_carattere_di_controllo(codice_fiscale)
    {
        var i;
        var val=0;
        for( i = 0 ; i < 15 ; i++){
            var c = codice_fiscale[i]
            if( i % 2){
                val += this.controlTableEven[c]
            }else{
                val += this.controlTableOdd[c]
            }
        }
        val= val % 26
        return this.controlTable.charAt(val)
    }
    //Calcola codice comune
    search_district(pattern_comune)
    {
        var codice,comune,ret = []
        var quoted = pattern_comune.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
        var re     = new RegExp(quoted,'i')
        for(codice in codici_catastali)
        {
            comune = codici_catastali[codice]
            if(comune.match(re) && comune == pattern_comune.toUpperCase()) ret.push([comune,codice])
        }
        return ret
    }
    //Codice comune
    code_district(pattern_comune)
    {
        if(pattern_comune.match(/^[A-Z]\d\d\d$/i)) return pattern_comune;

        return this.search_district(pattern_comune)[0][1];
    }

    //Combinazioni possibili per i numeri (128 combinazioni)
    getCombinations(list, n = 0, result = [], current = [])
    {
        if (n === list.length) {
            result.push(current)
        }else {
            list[n].forEach(item => this.getCombinations(list, n + 1, result, [...current, item]))
        }
        return result
    }
    //Calcolo 128 possiblità di codici fiscali(Omocodia)
     calcOmocodiePossibilities(code)
     {
        var codeArray = [...code];

        let number = code.match(/\d+/g).join('').split('')
        var arr2d = [[number[0], '-'],[number[1], '-'],[number[2], '-'],[number[3], '-'],[number[4], '-'],[number[5], '-'],[number[6], '-']];

        let combination = this.getCombinations(arr2d);

        var result = [];
        combination.forEach((value,index) => {
            codeArray = [...code]
            value.forEach((valore,indice) =>{

                if(valore == codeArray[this.positionOmocodia[indice]] ){

                    codeArray.splice(this.positionOmocodia[indice],1,this.controlTableHomocody[valore])

                }
            })
            var codeElement = codeArray.join('')
            if(result.includes(codeElement)){

            }else{
                codeElement = codeElement + this.calcola_carattere_di_controllo(codeElement)
                result.push(codeElement)
            }

        })
        return result;
    }

    //Calcola il codice fiscale alla fine quando abbiamo tutti i dati
    final_code(name,surname,gender,day,month,year,place)
    {
        var code =
            this.code_surname(surname)+
            this.code_name(name)+
            this.code_date(day,month,year,gender)+
            this.code_district(place)

        return code
    }
}