<template>
	<div class="form-div card-body">
		<h3>Список нод (Узлов)</h3>
		<div>
			<div v-for="tr in nodes" :key="tr">{{tr}}</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	created() {
		this.load_nodes();
	},

	data() {
		return {
			nodes: [],
		};
	},

	methods: {
		load_nodes() {
			console.log("LOADING contracts");
			axios
				.post(this.$conf.api_url + "sys/nodes")
				.then(res => (this.nodes = res.data));
		},

		load_transactions() {
			axios.post(this.$conf.api_url + "list_transactions").then(res => {
				console.log(res);
				this.transactions = res.data;
			});
		},

		create_contract() {
			axios
				.post(this.$conf.api_url + "create_contract", {
					params: { code: this.contract_code }
				})
				.then(res => {
					this.created_contract = res.id;
					this.load_contracts();
				});
			// alert(this.contract_code);
		},

		execute_contract() {
			axios
				.post(this.$conf.api_url + "call_contract", {
					params: { cid: this.cid, method: this.method, args: this.params }
				})
				.then(res => {
					console.log(res);
					this.load_transactions();
				});
		}
	}
};

// alert();
</script>
