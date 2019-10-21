<template>
	<div style="border: 1px solid #ff0">
		<h3>Контракты</h3>
		<div>
			<div v-for="tr in contracts" :key="tr">{{tr}}</div>
		</div>

		<div>
			<h3>Создание контракта</h3>
			<div>
				<textarea style="width: 50%; height: 50%;" placeholder="contract class code" v-model="contract_code"></textarea>
			</div>
			<div class="btn btn-sm btn-primary" @click="create_contract()">Создать</div> <span>{{created_contract}}</span>
		</div>

		<div>
			<h3>Вызвать метод</h3>
			<div>
				contract UID
				<input style="width: 400px" v-model="cid" />
				<br />contract method
				<input style="width: 400px" v-model="method" />
				<br />arguments
				<input style="width: 400px" v-model="params"/>
				<br />
                <div class="btn btn-sm btn-primary" @click="execute_contract()">Запустить</div> <span>{{created_transaction}}</span>
				<br />
			</div>
		</div>

		<div>
			<h3>Очередь транзакций</h3>
			<table border="1">
				<tr>
					<th>Transaction id</th>
					<th>State</th>
					<th>Result</th>
				</tr>
				<tr v-for="tr in transactions" :key="tr.id">
					<td>{{tr.id}}</td>
					<td>{{tr.state}}</td>
					<td>{{tr.result}}</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
module.exports = {
	created() {
		axios
			.post(this.$conf.api_url + "list_transactions")
			.then(res => (this.transactions = res.data));
		axios
			.post(this.$conf.api_url + "list_contracts")
			.then(res => (this.contracts = res.data));
	},

	data() {
		return {
			v: 100,
			transactions: [],
            contracts: [],
            contract_code: "",
            created_contract: "",
            cid: "",
            method: "",
            params: ""
		};
	},

	methods: {
		create_contract() {
			axios
				.post(this.$conf.api_url + "create_contract", {params: {code: this.contract_code}})
				.then(res => this.created_contract = res.id);
			// alert(this.contract_code);
        },
        
        execute_contract(){
            axios
				.post(this.$conf.api_url + "call_contract", {params: {cid: this.cid, method: this.method}})
				.then(res => console.log(res));
        }
	}
};

// alert();
</script>
