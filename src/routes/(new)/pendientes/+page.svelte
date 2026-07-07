<script lang="ts">
	import { fly } from 'svelte/transition';
	import TodoList from './_components/TodoList.svelte';
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
	<TodoList />
</div>
