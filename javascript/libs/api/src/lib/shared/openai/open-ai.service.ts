/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { Injectable } from '@angular/core';
import { ConfigService } from '@taiga/core';
import { Configuration, OpenAIApi } from 'openai';
import { filter, from, map } from 'rxjs';

interface OpenAIOptions {
  model: string;
  prompt: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

@Injectable({
  providedIn: 'root',
})
export class OpenAiService {
  constructor(private config: ConfigService) {}

  public getDataFromOpenAI(options: Partial<OpenAIOptions>) {
    const openAIConfig = this.config.openai;

    const configuration = new Configuration({
      apiKey: openAIConfig,
    });
    const openai = new OpenAIApi(configuration);

    return from(
      openai.createCompletion({
        model: options.model || 'text-davinci-003',
        prompt: options.prompt,
        max_tokens: options.max_tokens || 900,
        temperature: options.temperature || 0.5,
      })
    ).pipe(
      filter((resp) => !!resp && !!resp.data),
      map((resp) => resp.data),
      filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: any) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
          data.choices && data.choices.length > 0 && data.choices[0].text
      ),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      map((data) => data.choices[0].text)
    );
  }
}
