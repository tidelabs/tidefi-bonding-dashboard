
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        children: [
          {
            name: 'nothing',
            path: '',
            redirect: { name: 'home' }
          },
          {
            name: 'home',
            path: 'home',
            component: () => import('pages/HomePage.vue')
          },
          {
            name: 'validators',
            path: 'validators',
            component: () => import('pages/Validators.vue')
          },
          {
            name: 'validator-lookup',
            path: 'validator/:address?',
            component: () => import('pages/ValidatorInfo.vue')
          },
          {
            name: 'address-lookup',
            path: 'address/:address?',
            component: () => import('pages/AddressLookup.vue')
          }
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
