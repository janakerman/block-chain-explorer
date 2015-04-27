/// <reference path="../services/classes.ts" />

module myApp.masterPage {

    import IBlock = Classes.IBlock;

    export interface ITextFilter {
        (input: Array<IBlock>, filterText: string): Array<IBlock>
    }

    export class TextFilter {
        public static  Factory() {
            return function (input:Array<IBlock>, filterText:string) {
                if (!input || !filterText) {
                    return input;
                }

                var newArray = input.filter(function (element, index, array) {
                    var result = (element.hash.indexOf(filterText) > -1);
                    return result;
                });

                return newArray;
            }
        }
    }
}