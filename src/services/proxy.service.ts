import axios from "axios"
import type { AxiosRequestConfig } from "axios"


export async function proxyRequest<T>(
    config: AxiosRequestConfig
): Promise<T> {
    const res = await axios({
        ...config,

        proxy: false
    })

    return res.data
}