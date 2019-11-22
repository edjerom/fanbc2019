<template>
	<div class="">
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

<style>
td {
	padding:0 4px;
	border: 1px solid #999;
}
</style>

<script>
module.exports = {
	created() {
		this.load_transactions();
	},

	data() {
		return {
			transactions: [],
		};
	},

	methods: {
		load_transactions() {
			axios.post(this.$conf.api_url + "list_transactions").then(res => {
				console.log(res);
				this.transactions = res.data;
			});
		}
	}
};

</script>
