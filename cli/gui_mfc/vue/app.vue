<template>
	<div>
		<h1>МФЦ демо панель</h1>
		<nodes></nodes>

		<h3>Демонстрационный контракт</h3>

		<div class="row m-2"></div>
		<div class="border p-4 border rounded-lg">
			<h4>Запись данных</h4>Данные:
			<input class="form-control" placeholder="Например, 123" v-model="v" />
			<div class="btn btn-primary btn-sm my-2" @click="set">Записать</div>
			<div>txid: {{txid}}</div>
		</div>

		<div class="row m-2"></div>
		<div class="border p-4 border rounded-lg">
			<h4>Чтение данных</h4>
			<div class="btn btn-primary btn-sm my-2" @click="get">Прочитать</div>
			<div>Данные: {{data}}</div>
		</div>

		<div class="row m-2"></div>
		<div class="border p-4 border rounded-lg">
			<transactions ref="trs"></transactions>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			v: "",
			data: "()",
			txid: ""
		};
	},

	created() {},

	methods: {
		set() {
			axios
				.post(this.$conf.api_url + "call_contract", {
					params: {
						cid: "00155d17c1c099820001574316836970000004",
						method: "set",
						args: this.v
					}
				})
				.then(res => {					
                    this.txid = res.id;
                    this.$refs.trs.load_transactions()
                    setTimeout(() => this.$refs.trs.load_transactions(), 3000)
				});
		},
		get() {
			this.data = "Загрузка...";
			axios
				.post(
					this.$conf.api_url +
						"data/00155d17c1c099820001574316836970000004"
				)
				.then(res => {
					this.data = res.data;
				});
		}
	},

	components: {
		nodes: httpVueLoader("vue/nodes.vue"),
		transactions: httpVueLoader("vue/transactions.vue")
	}
};
</script>