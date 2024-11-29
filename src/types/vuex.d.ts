import * as Vuex from 'vuex'
import { TestState } from '@/store/modules/test'

declare module '@vue/runtime-core' {
    interface State {
        test: TestState
    }

    interface ComponentCustomProperties {
        $store: Vuex.Store<State>
    }
} 