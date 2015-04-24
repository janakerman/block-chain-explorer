module Classes {

    export interface ITransaction {
        hash: string;
    in: Array<any>;
        children: Array<ITransaction>
    }

    export interface IBlock {
        hash: string;
    }

}