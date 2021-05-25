<template>
  <v-app>
    <v-main>
      <SearchInterface />
    </v-main>
  </v-app>
</template>

<script>
import SearchInterface from "@/components/SearchInterface";

export default {
  name: 'App',

  components: {
    SearchInterface
  },

  data: () => ({
    //
  }),
};
</script>
