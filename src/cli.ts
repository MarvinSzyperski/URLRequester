import * as https from "https";
import * as http from "http";
import {program} from "commander";
import * as axios from "axios";
import * as enquirer from "enquirer";
import {log} from "util";

export async function cli(argv: string[]) {

    program
        .option('-g, --GET [url]', 'get')
        .option('-p, --POST [url]', 'post');

    program.parse(process.argv);

    if (program.POST !== undefined && program.GET !== undefined) {  //Wenn beide Wert haben dann beenden -> unschön aber keine bessere Lösung
        console.log("ERROR! CHOOSE ONE OPTION!");
        process.exit(1);
    }

    console.log(program.opts());
    if (program.GET) {
        get(program.GET);
    } else if (program.POST) {
        //let data: string[] = process.argv.slice(4);
        await post(program.POST);
    }


}

function get(url: string) {

    https.get(url, res => {
        let data: string = '';
        console.log(res.statusCode)
        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(JSON.parse(data));
        });

    }).on("error", error => {
        console.log("Error: " + error.message);
    });
}

async function post(url: string) {
    let objectToPost = getObjectToPost()
        .then(() =>axios.default.post(url, objectToPost)
            .then(res => console.log("HTTP StatusCode:" + res.status))
            .catch().catch(error => console.log(error)));


}

async function getObjectToPost(): Promise<object> {

    let repeat: boolean = true;
    let answers: object[] = [];
    while (repeat) {
        let promise = await enquirer.prompt([{
            type: 'select',
            name: 'datatype',
            message: 'Which datatype should the property be?',
            choices: ['String', 'Number', 'Boolean'],
        }, {
            type: 'input',
            name: 'property',
            message: 'How is the property called?'
        }, {
            type: 'input',
            name: 'value',
            message: 'Whats the value?'
        }, {
            type: 'confirm',
            name: 'repeat',
            message: 'Do you want to create another property?',
        }]);
        if (promise['datatype'] === "String" && typeof promise['value'] === "string"
            || promise['datatype'] === "Number" && !isNaN(promise['value'])
            || promise['datatype'] === "Boolean" && (promise['value'] === "true" || promise['value'] === "false")) {

            answers.push(promise);
            //Check for double properties!!!!
            //console.log(promise);

            if (promise['repeat'] === false) {
                repeat = false;
                break;
            }


        } else {
            console.log("Datatype doesn't match to the value given! Try again");
            promise = undefined;
            continue;
        }

    }
    return convertAnswersToJson(answers)
    //console.log(answers)


}

function convertAnswersToJson(answers: object[]): object {
    let answer: object;
    let json: string = '{';

    for (answer of answers) {
        json += '"' + answer['property'] + '": ';
        switch (answer['datatype']) {
            case "String":
                json += '"' + answer['value'] + '", ';
                break;
            case "Boolean":
                json += answer['value'] + ", ";
                break;
            case "Number":
                json += answer['value'] + ", "
        }
    }
    json = json.substring(0, json.length - 2)
    json += "}";
    let parse = JSON.parse(json);





    return parse;
}